/**
 * @file app/api/google/auth/stateless/callback/route.ts
 * @description Stateless OAuth callback that validates state without cookies
 */

import { NextRequest, NextResponse } from 'next/server';
import { getOAuth2Client } from '@/lib/google-drive';

export const dynamic = 'force-dynamic';

const GOOGLE_TOKEN_COOKIE = 'google_token';

export async function GET(req: NextRequest) {
  console.log('[stateless-callback] Processing stateless OAuth callback...');
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const stateParam = searchParams.get('state');

  console.log('[stateless-callback] Received params:', { 
    hasCode: !!code, 
    hasState: !!stateParam,
    stateParam: stateParam
  });

  if (!code) {
    console.log('[stateless-callback] Authorization code is missing');
    return NextResponse.json({ error: 'Authorization code is missing' }, { status: 400 });
  }

  if (!stateParam) {
    console.log('[stateless-callback] State parameter is missing');
    return NextResponse.json({ error: 'State parameter is missing' }, { status: 400 });
  }

  let state: { nonce: string; returnPath: string; timestamp: number };
  try {
    state = JSON.parse(Buffer.from(stateParam, 'base64').toString('utf8'));
    console.log('[stateless-callback] Decoded state:', state);
  } catch (error) {
    console.log('[stateless-callback] Failed to decode state:', error);
    return NextResponse.json({ error: 'Invalid state format.' }, { status: 400 });
  }

  const { returnPath, timestamp } = state;

  // Basic timestamp validation (state should not be older than 10 minutes)
  const now = Date.now();
  const maxAge = 10 * 60 * 1000; // 10 minutes
  if (now - timestamp > maxAge) {
    console.log('[stateless-callback] State has expired:', { 
      timestamp, 
      now, 
      age: now - timestamp, 
      maxAge 
    });
    return NextResponse.json({ error: 'Authentication state has expired. Please try again.' }, { status: 400 });
  }

  console.log('[stateless-callback] State validation passed');

  try {
    console.log('[stateless-callback] Exchanging code for tokens...');
    const oauth2Client = getOAuth2Client(req);
    const { tokens } = await oauth2Client.getToken(code);
    console.log('[stateless-callback] Tokens received successfully');

    // Store tokens in secure cookie
    const response = NextResponse.redirect(new URL(returnPath || '/', req.url));
    
    response.cookies.set(GOOGLE_TOKEN_COOKIE, JSON.stringify(tokens), {
      httpOnly: true,
      secure: true,
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
      sameSite: 'lax' // Use lax for the token cookie
    });

    console.log('[stateless-callback] Redirecting to:', returnPath || '/');
    return response;

  } catch (error: unknown) {
    const err = error as { response?: { data?: unknown }; message?: string };
    console.error('Error exchanging token:', err.response?.data || err.message || 'Unknown error');
    return NextResponse.json({ error: 'Failed to exchange authorization code for tokens' }, { status: 500 });
  }
}