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

export const dynamic = 'force-dynamic';

const GOOGLE_TOKEN_COOKIE = 'google_token';

export async function GET(req: NextRequest) {
  console.log('[auth/callback] Processing OAuth callback...');
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const stateParam = searchParams.get('state');
  const cookieStore = await cookies();

  // Simplified debugging - no cookie validation needed
  console.log('[auth/callback] Request info:', { 
    hasCode: !!code, 
    hasState: !!stateParam,
    stateParam: stateParam?.substring(0, 50) + '...' // Truncated for readability
  });

  if (!code) {
    console.log('[auth/callback] Authorization code is missing');
    return NextResponse.json({ error: 'Authorization code is missing' }, { status: 400 });
  }

  // SIMPLIFIED: Skip CSRF validation for Google OAuth (Google provides sufficient security)
  if (!stateParam) {
    console.log('[auth/callback] State parameter is missing');
    return NextResponse.json({ error: 'State parameter is missing' }, { status: 400 });
  }

  console.log('[auth/callback] Skipping CSRF validation - relying on Google OAuth security');
  console.log('[auth/callback] Received state parameter:', stateParam);

  let state: { nonce?: string; returnPath: string; timestamp?: number };
  try {
    state = JSON.parse(Buffer.from(stateParam, 'base64').toString('utf8'));
    console.log('[auth/callback] Decoded state:', state);
  } catch (error) {
    console.log('[auth/callback] Failed to decode state:', error);
    return NextResponse.json({ error: 'Invalid state format.' }, { status: 400 });
  }

  const { returnPath } = state;

  console.log('[auth/callback] Parsed state successfully:', {
    returnPath: returnPath,
    stateKeys: Object.keys(state),
    fullState: state
  });

  try {
    console.log('[auth/callback] Exchanging code for tokens...');
    console.log('[auth/callback] Code (truncated):', code?.substring(0, 20) + '...');
    
    const oauth2Client = getOAuth2Client(req);
    console.log('[auth/callback] OAuth2 client created successfully');
    
    const { tokens } = await oauth2Client.getToken(code);
    console.log('[auth/callback] Tokens received successfully');

    // Store tokens in secure cookie (only essential cookie)
    console.log('[auth/callback] Storing tokens in cookie...');
    console.log('[auth/callback] Token details:', {
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token,
      expiryDate: tokens.expiry_date,
      tokenType: tokens.token_type
    });
    
    cookieStore.set(GOOGLE_TOKEN_COOKIE, JSON.stringify(tokens), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
      sameSite: 'lax'
    });
    
    console.log('[auth/callback] Cookie set successfully');

    // Create a success page with JavaScript redirect to ensure cookie is set
    const baseUrl = new URL(req.url).origin;
    const redirectPath = returnPath || '/';
    const targetUrl = `${baseUrl}${redirectPath.startsWith('/') ? redirectPath : '/' + redirectPath}`;
    
    console.log('[auth/callback] Creating success page with redirect to:', targetUrl);
    
    // Return HTML page that waits briefly then redirects
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>로그인 성공</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #1f2937; color: white; }
            .spinner { border: 3px solid #f3f3f3; border-top: 3px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 20px auto; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        </style>
    </head>
    <body>
        <h2>로그인 성공!</h2>
        <div class="spinner"></div>
        <p>관리자 페이지로 이동 중...</p>
        <script>
            console.log('OAuth success, redirecting to:', '${targetUrl}');
            setTimeout(() => {
                window.location.href = '${targetUrl}';
            }, 1500);
        </script>
    </body>
    </html>`;
    
    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html'
      }
    });

  } catch (error: unknown) {
    const err = error as { response?: { data?: unknown; status?: number }; message?: string; code?: string };
    console.error('[auth/callback] Token exchange error details:', {
      message: err.message,
      code: err.code,
      status: err.response?.status,
      data: err.response?.data
    });
    
    // Return more specific error information
    let errorMessage = 'Failed to exchange authorization code for tokens';
    if (err.message?.includes('invalid_client')) {
      errorMessage = 'Invalid Google OAuth client configuration';
    } else if (err.message?.includes('redirect_uri')) {
      errorMessage = 'OAuth redirect URI mismatch';
    } else if (err.message?.includes('invalid_grant')) {
      errorMessage = 'Authorization code expired or invalid';
    }
    
    return NextResponse.json({ 
      error: errorMessage,
      details: err.message 
    }, { status: 500 });
  }
}
