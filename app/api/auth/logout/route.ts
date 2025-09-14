
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

const GOOGLE_TOKEN_COOKIE = 'google_token';
const ADMIN_COOKIE_NAME = 'admin-token';

export async function POST(req: NextRequest) {
  try {
    console.log('[auth/logout] Processing logout request...');
    
    const cookieStore = await cookies();
    
    // Clear both Google OAuth token and admin JWT token cookies
    cookieStore.delete(GOOGLE_TOKEN_COOKIE);
    cookieStore.delete(ADMIN_COOKIE_NAME);

    console.log('[auth/logout] Both Google OAuth and admin JWT tokens cleared');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Successfully logged out' 
    });
    
  } catch (error) {
    console.error('[auth/logout] Error during logout:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Logout failed' 
    }, { status: 500 });
  }
}
