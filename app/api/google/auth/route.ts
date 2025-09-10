/**
 * @file app/api/google/auth/route.ts
 * @description API route for handling the initial Google OAuth 2.0 authentication request.
 */

import { NextResponse } from 'next/server';
import { getAuthorizationUrl } from '@/lib/google-drive';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

const OAUTH_STATE_COOKIE = 'google_oauth_state';

export async function GET() {
  try {
    const state = Buffer.from(Math.random().toString()).toString('base64');
    const maxAge = 60 * 5; // 5 minutes

    const cookieStore = await cookies();
    cookieStore.set(OAUTH_STATE_COOKIE, state, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      maxAge: maxAge,
      path: '/',
    });

    const authorizationUrl = getAuthorizationUrl(state);

    return NextResponse.json({ authUrl: authorizationUrl });

  } catch (error) {
    console.error('Error during Google Auth initiation:', error);
    return NextResponse.json(
      { error: 'Failed to initiate authentication' },
      { status: 500 }
    );
  }
}
