import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

export const dynamic = 'force-dynamic';

// Constants for password-based auth
const ADMIN_COOKIE_NAME = 'admin-token';
const JWT_SECRET = process.env.JWT_SECRET || 'b7e8f9g2h3i4j5k6l7m8n9p0q1r2s3t4u5v6w7x8y9z0a1b2c3d4e5f6';

// Constant for Google-based auth
const GOOGLE_TOKEN_COOKIE = 'google_token';

export async function GET(req: NextRequest) {
  try {
    console.log('[auth/status] Checking authentication status...');
    const cookieStore = await cookies();

    // 1. Check for password-based JWT token
    const adminTokenCookie = cookieStore.get(ADMIN_COOKIE_NAME);
    if (adminTokenCookie && adminTokenCookie.value) {
      console.log('[auth/status] Found admin-token cookie. Verifying...');
      try {
        const secretKey = new TextEncoder().encode(JWT_SECRET);
        await jwtVerify(adminTokenCookie.value, secretKey, { algorithms: ['HS256'] });
        console.log('[auth/status] Admin JWT is valid.');
        return NextResponse.json({ isAuthenticated: true });
      } catch (jwtError) {
        if (jwtError instanceof Error) {
          console.log('[auth/status] Admin JWT verification failed:', jwtError.message);
        } else {
          console.log('[auth/status] Admin JWT verification failed with an unknown error:', jwtError);
        }
        // If JWT is invalid, don't immediately return. Fall through to check for Google token.
      }
    }

    // 2. Check for Google OAuth token (the original logic)
    const googleTokenCookie = cookieStore.get(GOOGLE_TOKEN_COOKIE);
    if (!googleTokenCookie || !googleTokenCookie.value) {
      console.log('[auth/status] No valid admin or google token cookie found.');
      return NextResponse.json({ isAuthenticated: false });
    }

    try {
      const tokens = JSON.parse(googleTokenCookie.value);
      console.log('[auth/status] Google token found, checking validity...');

      if (!tokens.access_token) {
        console.log('[auth/status] No access token in cookie');
        return NextResponse.json({ isAuthenticated: false });
      }

      if (tokens.expiry_date && tokens.expiry_date < Date.now()) {
        console.log('[auth/status] Token expired');
        return NextResponse.json({ isAuthenticated: false });
      }

      console.log('[auth/status] User is authenticated with Google OAuth');
      return NextResponse.json({
        isAuthenticated: true,
        tokenExists: true,
        hasAccessToken: !!tokens.access_token,
        hasRefreshToken: !!tokens.refresh_token
      });

    } catch (parseError) {
      console.error('[auth/status] Error parsing Google token cookie:', parseError);
      return NextResponse.json({ isAuthenticated: false });
    }

  } catch (error) {
    console.error('[auth/status] Error checking authentication status:', error);
    return NextResponse.json({ isAuthenticated: false, error: 'Internal server error' });
  }
}