import { NextRequest, NextResponse } from 'next/server';
import { getAuthorizationUrl } from '@/lib/google-drive';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    console.log('[debug-oauth] Starting OAuth debug test...');
    
    // Test state generation
    const testState = {
      nonce: 'test-nonce-123',
      returnPath: '/admin'
    };
    const stateString = Buffer.from(JSON.stringify(testState)).toString('base64');
    
    // Generate authorization URL
    const authUrl = getAuthorizationUrl(stateString, req);
    
    // Parse the URL to show all parameters
    const url = new URL(authUrl);
    const params = Object.fromEntries(url.searchParams.entries());
    
    return NextResponse.json({
      success: true,
      authUrl: authUrl,
      baseUrl: `${url.protocol}//${url.host}${url.pathname}`,
      parameters: params,
      testState: testState,
      encodedState: stateString,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('[debug-oauth] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}