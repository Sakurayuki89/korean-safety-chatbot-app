/**
 * @file app/api/google/auth/route.ts
 * @description API route for handling the initial Google OAuth 2.0 authentication request.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthorizationUrl } from '@/lib/google-drive';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

const OAUTH_STATE_COOKIE = 'google_oauth_state';

export async function GET(req: NextRequest) {
  try {
    console.log('[auth] Starting OAuth flow...');
    const { searchParams } = new URL(req.url);
    const returnPath = searchParams.get('returnPath') || '/';
    console.log('[auth] Return path:', returnPath);
    
    const nonce = Buffer.from(Math.random().toString()).toString('base64');
    console.log('[auth] Generated nonce:', nonce);
    
    const state = {
      nonce,
      returnPath,
    };
    const stateString = Buffer.from(JSON.stringify(state)).toString('base64');
    console.log('[auth] Encoded state:', stateString);
    
    const maxAge = 60 * 5; // 5 minutes

    const authorizationUrl = getAuthorizationUrl(stateString, req);
    console.log('[auth] Generated authorization URL');

    // Create response first
    const response = NextResponse.json({ 
      authUrl: authorizationUrl,
      state: stateString,
      nonce: nonce
    });
    
    // Try multiple cookie strategies
    const cookieOptions1 = {
      httpOnly: false, // Allow client-side access for debugging
      secure: true,
      maxAge: maxAge,
      path: '/',
      sameSite: 'none' as const
    };
    
    const cookieOptions2 = {
      httpOnly: false,
      secure: true,
      maxAge: maxAge,
      path: '/',
      sameSite: 'lax' as const
    };
    
    const cookieOptions3 = {
      httpOnly: false,
      secure: false, // Try without secure for testing
      maxAge: maxAge,
      path: '/',
      sameSite: 'lax' as const
    };
    
    // Set multiple cookies with different strategies
    response.cookies.set(OAUTH_STATE_COOKIE + '_none', stateString, cookieOptions1);
    response.cookies.set(OAUTH_STATE_COOKIE + '_lax_secure', stateString, cookieOptions2);
    response.cookies.set(OAUTH_STATE_COOKIE + '_lax_insecure', stateString, cookieOptions3);
    
    console.log('[auth] Set multiple test cookies:', {
      name1: OAUTH_STATE_COOKIE + '_none',
      name2: OAUTH_STATE_COOKIE + '_lax_secure', 
      name3: OAUTH_STATE_COOKIE + '_lax_insecure',
      value: stateString,
      options1: cookieOptions1,
      options2: cookieOptions2,
      options3: cookieOptions3
    });
    
    return response;

  } catch (error) {
    console.error('Error during Google Auth initiation:', error);
    return NextResponse.json(
      { error: 'Failed to initiate authentication' },
      { status: 500 }
    );
  }
}
