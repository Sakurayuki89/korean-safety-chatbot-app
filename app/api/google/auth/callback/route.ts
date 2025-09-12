/**
 * @file app/api/google/auth/callback/route.ts
 * @description API route to handle the OAuth 2.0 callback from Google.
 *
 * This route exchanges the authorization code for access and refresh tokens,
 * then securely stores them in an HTTP-only cookie.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getOAuth2Client } from '@/lib/google-drive';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic'; // Force dynamic rendering

const OAUTH_STATE_COOKIE = 'google_oauth_state';
const GOOGLE_TOKEN_COOKIE = 'google_token';

export async function GET(req: NextRequest) {
  console.log('[auth/callback] Processing OAuth callback...');
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const stateParam = searchParams.get('state');
  const cookieStore = await cookies();
  const storedNonce = cookieStore.get(OAUTH_STATE_COOKIE)?.value;

  console.log('[auth/callback] Params received:', { 
    hasCode: !!code, 
    hasState: !!stateParam, 
    hasStoredNonce: !!storedNonce 
  });

  if (!code) {
    console.log('[auth/callback] Authorization code is missing');
    return NextResponse.json({ error: 'Authorization code is missing' }, { status: 400 });
  }

  if (!stateParam || !storedNonce) {
    console.log('[auth/callback] State parameter or cookie is missing');
    return NextResponse.json({ error: 'State parameter or cookie is missing' }, { status: 400 });
  }

  let state: { nonce: string; returnPath: string };
  try {
    state = JSON.parse(Buffer.from(stateParam, 'base64').toString('utf8'));
  } catch {
    return NextResponse.json({ error: 'Invalid state format.' }, { status: 400 });
  }

  const { nonce, returnPath } = state;

  // --- CSRF Protection ---
  if (nonce !== storedNonce) {
    return NextResponse.json({ error: 'Invalid state parameter. CSRF attack suspected.' }, { status: 400 });
  }

  try {
    console.log('[auth/callback] Exchanging code for tokens...');
    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    console.log('[auth/callback] Tokens received successfully');

    // --- Store Tokens in Secure Cookie ---
    console.log('[auth/callback] Storing tokens in cookie...');
    cookieStore.set(GOOGLE_TOKEN_COOKIE, JSON.stringify(tokens), {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    // Clear the state cookie now that it has been used
    cookieStore.delete(OAUTH_STATE_COOKIE);

    // Redirect user back to the original page
    const redirectUrl = new URL(returnPath || '/', req.url);
    console.log('[auth/callback] Redirecting to:', redirectUrl.toString());
    return NextResponse.redirect(redirectUrl);

  } catch (error: unknown) {
    const err = error as { response?: { data?: unknown }; message?: string };
    console.error('Error exchanging token:', err.response?.data || err.message || 'Unknown error');
    return NextResponse.json({ error: 'Failed to exchange authorization code for tokens' }, { status: 500 });
  }
}
