import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// --- Constants ---
const ADMIN_COOKIE_NAME = 'admin-token';
const GOOGLE_TOKEN_COOKIE = 'google_token';
const JWT_SECRET = 'b7e8f9g2h3i4j5k6l7m8n9p0q1r2s3t4u5v6w7x8y9z0a1b2c3d4e5f6';
const secretKey = new TextEncoder().encode(JWT_SECRET);

// Debug: Log JWT_SECRET info (temporary)
console.log('[middleware] JWT_SECRET length:', JWT_SECRET.length);
console.log('[middleware] JWT_SECRET first 10 chars:', JWT_SECRET.substring(0, 10));

// --- Helper Functions ---
async function verifyGoogleToken(tokenString: string): Promise<boolean> {
  try {
    const tokens = JSON.parse(tokenString);
    if (!tokens.access_token) return false;
    if (tokens.expiry_date && tokens.expiry_date < Date.now()) return false;
    return true;
  } catch (error) {
    console.error('Google Token Verification Error:', error);
    return false;
  }
}

// --- Middleware ---
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Exclude static assets and internal Next.js paths
  if (pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next();
  }

  // Protect admin routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    // Allow login API to be accessed publicly
    if (pathname === '/api/auth/login') {
        return NextResponse.next();
    }

    // 1. Check for password-based JWT token (using jose)
    const adminToken = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    if (adminToken) {
      try {
        console.log(`[middleware] Verifying JWT token for ${pathname}`);
        await jwtVerify(adminToken, secretKey, { algorithms: ['HS256'] });
        console.log(`[middleware] JWT verification successful for ${pathname}`);
        return NextResponse.next(); // SUCCESS: JWT is valid
      } catch (err) {
        console.error(`[middleware] JWT verification failed for ${pathname}:`, err);
        // JWT is invalid, fall through to check for Google token
      }
    } else {
      console.log(`[middleware] No admin token found for ${pathname}`);
    }

    // 2. Check for Google OAuth token
    const googleToken = request.cookies.get(GOOGLE_TOKEN_COOKIE)?.value;
    if (googleToken && (await verifyGoogleToken(googleToken))) {
      return NextResponse.next(); // SUCCESS: Google token is valid
    }

    // 3. If no valid token, handle redirection or API denial
    if (pathname.startsWith('/api/admin')) {
      return new NextResponse(
        JSON.stringify({ success: false, message: 'Authentication required' }),
        { status: 401, headers: { 'content-type': 'application/json' } }
      );
    }

    // For non-API /admin routes, allow access to the login page itself
    if (pathname === '/admin') {
      return NextResponse.next();
    }

    // For any other protected page, redirect to the login page
    const loginUrl = new URL('/admin', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// --- Config ---
export const config = {
  matcher: ['/admin', '/admin/:path*', '/api/admin/:path*'],
};