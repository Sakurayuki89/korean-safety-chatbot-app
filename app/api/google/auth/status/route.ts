import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * @route GET /api/google/auth/status
 * @description Checks the user's authentication status by verifying the presence and validity of the Google token cookie.
 * @returns { isAuthenticated: boolean }
 */
export async function GET() {
  const cookieStore = cookies();
  const tokenCookie = cookieStore.get('google_token');

  if (!tokenCookie) {
    return NextResponse.json({ isAuthenticated: false });
  }

  try {
    // Basic validation: check if the cookie value is valid JSON and has an access_token
    const token = JSON.parse(tokenCookie.value);
    if (token && token.access_token) {
      // For a more robust check, you could optionally verify the token with Google's tokeninfo endpoint here.
      return NextResponse.json({ isAuthenticated: true });
    }
    return NextResponse.json({ isAuthenticated: false });
  } catch (error) {
    console.error('Error parsing token cookie:', error);
    return NextResponse.json({ isAuthenticated: false });
  }
}
