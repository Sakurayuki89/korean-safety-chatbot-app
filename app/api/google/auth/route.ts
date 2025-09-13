/**
 * @file app/api/google/auth/route.ts
 * @description API route for handling the initial Google OAuth 2.0 authentication request.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthorizationUrl } from '@/lib/google-drive';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    console.log('[auth] Starting OAuth flow...');
    const { searchParams } = new URL(req.url);
    const returnPath = searchParams.get('returnPath') || '/';
    console.log('[auth] Return path:', returnPath);
    
    // Add timestamp for stateless validation
    const timestamp = Date.now();
    
    const state = {
      returnPath,
      timestamp
    };
    const stateString = Buffer.from(JSON.stringify(state)).toString('base64');
    console.log('[auth] Encoded state:', stateString);
    
    const authorizationUrl = getAuthorizationUrl(stateString, req);
    console.log('[auth] Generated authorization URL');

    // STATELESS: Return simple JSON response without any cookies
    return NextResponse.json({ 
      authUrl: authorizationUrl,
      state: stateString,
      timestamp: timestamp
    });

  } catch (error) {
    console.error('Error during Google Auth initiation:', error);
    return NextResponse.json(
      { error: 'Failed to initiate authentication' },
      { status: 500 }
    );
  }
}
