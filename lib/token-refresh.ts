import { google } from 'googleapis';
import { cookies } from 'next/headers';

const GOOGLE_TOKEN_COOKIE = 'google_token';

interface TokenData {
  access_token: string;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
  expiry_date?: number;
}

export async function getValidAccessToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get(GOOGLE_TOKEN_COOKIE)?.value;
    
    if (!tokenCookie) {
      console.log('[getValidAccessToken] No token cookie found');
      return null;
    }
    
    const tokenData: TokenData = JSON.parse(tokenCookie);
    
    if (!tokenData.access_token) {
      console.log('[getValidAccessToken] No access token in cookie');
      return null;
    }

    // OAuth2 클라이언트 설정
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials(tokenData);

    // 토큰 만료 체크 및 갱신
    if (tokenData.expiry_date && tokenData.expiry_date < Date.now()) {
      console.log('[getValidAccessToken] Token expired, attempting refresh');
      
      if (tokenData.refresh_token) {
        try {
          const { credentials } = await oauth2Client.refreshAccessToken();
          
          if (credentials.access_token) {
            console.log('[getValidAccessToken] Token refreshed successfully');
            return credentials.access_token;
          }
        } catch (refreshError) {
          console.error('[getValidAccessToken] Token refresh failed:', refreshError);
          throw new Error('토큰 갱신에 실패했습니다. 다시 로그인해주세요.');
        }
      } else {
        throw new Error('Refresh token이 없습니다. 다시 로그인해주세요.');
      }
    }
    
    return tokenData.access_token;
  } catch (error) {
    console.error('[getValidAccessToken] Error:', error);
    return null;
  }
}

export async function createAuthenticatedGoogleClient() {
  const accessToken = await getValidAccessToken();
  
  if (!accessToken) {
    throw new Error('유효한 Google 인증 토큰이 없습니다.');
  }

  // Check if OAuth credentials are configured
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error('Google OAuth credentials (CLIENT_ID, CLIENT_SECRET) are not configured in .env.local');
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  
  oauth2Client.setCredentials({ access_token: accessToken });
  
  return oauth2Client;
}