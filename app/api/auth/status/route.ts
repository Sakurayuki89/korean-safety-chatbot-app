
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

const GOOGLE_TOKEN_COOKIE = 'google_token';

export async function GET(req: NextRequest) {
  try {
    console.log('[auth/status] Checking authentication status...');
    
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get(GOOGLE_TOKEN_COOKIE);
    
    if (!tokenCookie || !tokenCookie.value) {
      console.log('[auth/status] No Google token cookie found');
      return NextResponse.json({ isAuthenticated: false });
    }
    
    try {
      const tokens = JSON.parse(tokenCookie.value);
      console.log('[auth/status] Google token found, checking validity...');
      
      // Basic token structure validation
      if (!tokens.access_token) {
        console.log('[auth/status] No access token in cookie');
        return NextResponse.json({ isAuthenticated: false });
      }
      
      // Check if token is expired (if expiry info is available)
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
    return NextResponse.json({ isAuthenticated: false });
  }
}
