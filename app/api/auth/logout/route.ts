
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

const GOOGLE_TOKEN_COOKIE = 'google_token';

export async function POST(req: NextRequest) {
  try {
    console.log('[auth/logout] Processing logout request...');
    
    const cookieStore = await cookies();
    
    // Clear the Google OAuth token cookie
    cookieStore.delete(GOOGLE_TOKEN_COOKIE);
    
    console.log('[auth/logout] Google OAuth token cleared');
    
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
