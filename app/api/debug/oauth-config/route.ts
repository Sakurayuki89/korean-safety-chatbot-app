import { NextRequest, NextResponse } from 'next/server';
import { getOAuth2Client } from '@/lib/google-drive';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    console.log('[debug-oauth-config] Checking OAuth configuration...');
    
    // Test OAuth client creation
    const oauth2Client = getOAuth2Client(req);
    
    const config = {
      hasClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: process.env.GOOGLE_REDIRECT_URI || 'https://korean-safety-chatbot-app.vercel.app/api/google/auth/callback',
      currentDomain: req.headers.get('host'),
      expectedCallback: `https://${req.headers.get('host')}/api/google/auth/callback`,
      timestamp: new Date().toISOString()
    };
    
    console.log('[debug-oauth-config] Configuration:', config);
    
    return NextResponse.json({
      success: true,
      config: config,
      message: 'OAuth client created successfully'
    });
    
  } catch (error) {
    console.error('[debug-oauth-config] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}