
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const GOOGLE_TOKEN_COOKIE = 'google_token';

async function verifyGoogleToken(tokenString: string): Promise<boolean> {
  try {
    const tokens = JSON.parse(tokenString);
    
    // Basic token structure validation
    if (!tokens.access_token) {
      return false;
    }
    
    // Check if token is expired (if expiry info is available)
    if (tokens.expiry_date && tokens.expiry_date < Date.now()) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Google Token Verification Error:', error);
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Exclude static files and Next.js internal paths
  if (
    pathname.startsWith('/_next') || // Next.js internals
    pathname.includes('.') || // Files with extensions
    pathname === '/api/auth/login' // The login API itself
  ) {
    return NextResponse.next();
  }

  // Check if the request is for the admin page or an admin API route
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    console.log('[middleware] Checking auth for:', pathname);
    
    const token = request.cookies.get(GOOGLE_TOKEN_COOKIE)?.value;
    console.log('[middleware] Google token exists:', !!token);

    // The /admin page itself will handle the redirect to the login form.
    // This middleware will primarily protect direct access to sub-pages and APIs.
    if (!token || !(await verifyGoogleToken(token))) {
      console.log('[middleware] Google token invalid or missing');
      
      // For API routes, deny access
      if (pathname.startsWith('/api/admin')) {
        return new NextResponse(
          JSON.stringify({ success: false, message: 'Authentication required' }),
          { status: 401, headers: { 'content-type': 'application/json' } }
        );
      }

      // For the /admin page, allow the request to proceed.
      // The page itself will render the Google login component if not authenticated.
      if (pathname === '/admin') {
        console.log('[middleware] Allowing access to /admin for login');
        return NextResponse.next();
      }

      // For any other /admin sub-pages, redirect to the main /admin login page.
      console.log('[middleware] Redirecting to /admin for login');
      request.nextUrl.pathname = '/admin';
      return NextResponse.redirect(request.nextUrl);
    }
    
    console.log('[middleware] Google token valid, allowing access');
  }

  return NextResponse.next();
}

// Define which paths the middleware should run on.
export const config = {
  matcher: ['/admin', '/admin/:path*', '/api/admin/:path*'],
};
