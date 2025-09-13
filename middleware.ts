
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_NAME = 'admin-token';

async function verifyToken(token: string, secret: string): Promise<boolean> {
  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return true;
  } catch (error) {
    console.error('JWT Verification Error:', error);
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the request is for the admin page or an admin API route
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    if (!JWT_SECRET) {
      console.error('JWT_SECRET is not set. Allowing access to admin page for login.');
      // Allow access to admin page for login, but deny API access
      if (pathname.startsWith('/api/admin')) {
        return new NextResponse(
          JSON.stringify({ success: false, message: 'Server configuration error' }),
          { status: 500, headers: { 'content-type': 'application/json' } }
        );
      }
      return NextResponse.next();
    }

    const token = request.cookies.get(COOKIE_NAME)?.value;

    // The /admin page itself will handle the redirect to the login form.
    // This middleware will primarily protect direct access to sub-pages and APIs.
    if (!token || !(await verifyToken(token, JWT_SECRET))) {
      // For API routes, deny access
      if (pathname.startsWith('/api/admin')) {
        return new NextResponse(
          JSON.stringify({ success: false, message: 'Authentication failed' }),
          { status: 401, headers: { 'content-type': 'application/json' } }
        );
      }

      // For the /admin page, allow the request to proceed.
      // The page itself will render the PasswordAuth component if not authenticated.
      // This prevents a redirect loop if the login page is also at /admin.
      if (pathname === '/admin') {
        return NextResponse.next();
      }

      // For any other /admin sub-pages, redirect to the main /admin login page.
      request.nextUrl.pathname = '/admin';
      return NextResponse.redirect(request.nextUrl);
    }
  }

  return NextResponse.next();
}

// Define which paths the middleware should run on.
export const config = {
  matcher: ['/admin', '/admin/:path*', '/api/admin/:path*'],
};
