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

    const cookieStore = cookies();
    cookieStore.set(OAUTH_STATE_COOKIE, nonce, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      maxAge: maxAge,
      path: '/',
      sameSite: 'lax'  // Add sameSite attribute
    });
    
    console.log('[auth] Set state cookie with nonce:', nonce);

    const authorizationUrl = getAuthorizationUrl(stateString, req);
    console.log('[auth] Generated authorization URL');

    return NextResponse.json({ authUrl: authorizationUrl });

  } catch (error) {
    console.error('Error during Google Auth initiation:', error);
    return NextResponse.json(
      { error: 'Failed to initiate authentication' },
      { status: 500 }
    );
  }
}
