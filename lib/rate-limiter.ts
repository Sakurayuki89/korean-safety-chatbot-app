// Simple in-memory rate limiter for Vercel serverless environment
// Suitable for service-level applications without external dependencies

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class SimpleRateLimiter {
  private requests = new Map<string, RateLimitEntry>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * Check if a request should be rate limited
   * @param identifier - Unique identifier (IP address, user ID, etc.)
   * @param limit - Number of requests allowed
   * @param windowMs - Time window in milliseconds
   * @returns Object with success status and remaining requests
   */
  checkLimit(identifier: string, limit: number, windowMs: number): {
    success: boolean;
    remaining: number;
    resetTime: number;
  } {
    const now = Date.now();
    const resetTime = now + windowMs;

    const existing = this.requests.get(identifier);

    if (!existing || existing.resetTime <= now) {
      // New window or expired window
      this.requests.set(identifier, {
        count: 1,
        resetTime
      });

      return {
        success: true,
        remaining: limit - 1,
        resetTime
      };
    }

    if (existing.count >= limit) {
      // Rate limit exceeded
      return {
        success: false,
        remaining: 0,
        resetTime: existing.resetTime
      };
    }

    // Increment counter
    existing.count++;
    this.requests.set(identifier, existing);

    return {
      success: true,
      remaining: limit - existing.count,
      resetTime: existing.resetTime
    };
  }

  /**
   * Clean up expired entries to prevent memory leaks
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.requests.entries()) {
      if (entry.resetTime <= now) {
        this.requests.delete(key);
      }
    }
  }

  /**
   * Get current stats for monitoring
   */
  getStats(): {
    activeEntries: number;
    totalMemoryUsage: number;
  } {
    return {
      activeEntries: this.requests.size,
      totalMemoryUsage: this.requests.size * 64 // Rough estimate in bytes
    };
  }

  /**
   * Clear all rate limit data (for testing)
   */
  clear(): void {
    this.requests.clear();
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.requests.clear();
  }
}

// Global instance for the serverless environment
const rateLimiter = new SimpleRateLimiter();

export default rateLimiter;

// Predefined rate limiting configurations
export const RATE_LIMITS = {
  // Authentication endpoints - strict limits
  AUTH_LOGIN: {
    limit: 5,      // 5 attempts
    windowMs: 15 * 60 * 1000,  // 15 minutes
    message: '너무 많은 로그인 시도입니다. 15분 후 다시 시도해주세요.'
  },

  // Admin endpoints - moderate limits
  ADMIN_API: {
    limit: 30,     // 30 requests
    windowMs: 5 * 60 * 1000,   // 5 minutes
    message: '관리자 API 요청이 너무 많습니다. 5분 후 다시 시도해주세요.'
  },

  // QR generation - generous limits
  QR_GENERATION: {
    limit: 50,     // 50 requests
    windowMs: 10 * 60 * 1000,  // 10 minutes
    message: 'QR 생성 요청이 너무 많습니다. 10분 후 다시 시도해주세요.'
  },

  // General API - very generous limits
  GENERAL_API: {
    limit: 100,    // 100 requests
    windowMs: 10 * 60 * 1000,  // 10 minutes
    message: 'API 요청이 너무 많습니다. 10분 후 다시 시도해주세요.'
  }
} as const;

/**
 * Helper function to get client IP address from Next.js request
 */
export function getClientIP(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const clientIP = request.headers.get('x-client-ip');

  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  if (clientIP) {
    return clientIP;
  }

  // Fallback for development
  return '127.0.0.1';
}

/**
 * Rate limiting middleware function
 */
export function createRateLimitResponse(
  identifier: string,
  config: typeof RATE_LIMITS[keyof typeof RATE_LIMITS]
): Response | null {
  const result = rateLimiter.checkLimit(identifier, config.limit, config.windowMs);

  if (!result.success) {
    const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);

    return new Response(
      JSON.stringify({
        error: config.message,
        retryAfter: retryAfter
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': config.limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': result.resetTime.toString()
        }
      }
    );
  }

  return null; // No rate limiting applied
}