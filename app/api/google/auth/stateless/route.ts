/**
 * @file app/api/google/auth/stateless/route.ts
 * @description Stateless OAuth flow that doesn't rely on cookies
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthorizationUrl } from '@/lib/google-drive';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    console.log('[stateless-auth] Starting stateless OAuth flow...');
    const { searchParams } = new URL(req.url);
    const returnPath = searchParams.get('returnPath') || '/';
    console.log('[stateless-auth] Return path:', returnPath);
    
    // Create a simple timestamp-based nonce for basic CSRF protection
    const timestamp = Date.now();
    const randomPart = Math.random().toString(36).substring(2);
    const nonce = `${timestamp}_${randomPart}`;
    
    const state = {
      nonce,
      returnPath,
      timestamp
    };
    const stateString = Buffer.from(JSON.stringify(state)).toString('base64');
    console.log('[stateless-auth] Generated state:', stateString);
    
    const authorizationUrl = getAuthorizationUrl(stateString, req);
    console.log('[stateless-auth] Generated authorization URL');

    // Return the auth URL - no cookies needed
    return NextResponse.json({ 
      authUrl: authorizationUrl,
      state: stateString,
      nonce: nonce,
      timestamp: timestamp
    });

  } catch (error) {
    console.error('Error during stateless Google Auth initiation:', error);
    return NextResponse.json(
      { error: 'Failed to initiate authentication' },
      { status: 500 }
    );
  }
}