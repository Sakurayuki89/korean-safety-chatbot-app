import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * @route GET /api/google/auth/status
 * @description Checks the user's authentication status by verifying the presence and validity of the Google token cookie.
 * @returns { isAuthenticated: boolean }
 */
export async function GET() {
  console.log('[auth/status] Checking authentication status...');
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get('google_token');

  console.log('[auth/status] Token cookie exists:', !!tokenCookie);
  if (!tokenCookie) {
    console.log('[auth/status] No token cookie found, user not authenticated');
    return NextResponse.json({ isAuthenticated: false });
  }

  try {
    // Basic validation: check if the cookie value is valid JSON and has an access_token
    const token = JSON.parse(tokenCookie.value);
    console.log('[auth/status] Token parsed successfully, has access_token:', !!token?.access_token);
    if (token && token.access_token) {
      // For a more robust check, you could optionally verify the token with Google's tokeninfo endpoint here.
      console.log('[auth/status] User is authenticated');
      return NextResponse.json({ isAuthenticated: true });
    }
    console.log('[auth/status] Token exists but no access_token found');
    return NextResponse.json({ isAuthenticated: false });
  } catch (error) {
    console.error('[auth/status] Error parsing token cookie:', error);
    return NextResponse.json({ isAuthenticated: false });
  }
}
