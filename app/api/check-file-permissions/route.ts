import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDriveClient } from '@/lib/google-drive';

export const dynamic = 'force-dynamic';

const GOOGLE_TOKEN_COOKIE = 'google_token';

// Helper function to get OAuth2 client with access token
const getDriveClientWithToken = (accessToken: string) => {
  const { google } = require('googleapis');
  const { OAuth2Client } = require('google-auth-library');
  
  const oauth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  
  oauth2Client.setCredentials({ access_token: accessToken });
  return google.drive({ version: 'v3', auth: oauth2Client });
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fileId = searchParams.get('fileId');
  
  if (!fileId) {
    return NextResponse.json({ error: 'File ID required' }, { status: 400 });
  }

  try {
    // Get access token
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get(GOOGLE_TOKEN_COOKIE)?.value;
    if (!tokenCookie) {
      return NextResponse.json({ error: '인증되지 않았습니다.' }, { status: 401 });
    }
    
    const { access_token } = JSON.parse(tokenCookie);
    if (!access_token) {
      return NextResponse.json({ error: '유효하지 않은 인증 토큰입니다.' }, { status: 401 });
    }

    const drive = getDriveClientWithToken(access_token);
    
    // Get file metadata and permissions
    const fileResponse = await drive.files.get({
      fileId: fileId,
      fields: 'id, name, mimeType, size, createdTime, modifiedTime, webViewLink, webContentLink, parents, permissions'
    });
    
    const permissionsResponse = await drive.permissions.list({
      fileId: fileId,
      fields: 'permissions(id, type, role, emailAddress)'
    });

    return NextResponse.json({
      file: fileResponse.data,
      permissions: permissionsResponse.data.permissions,
      suggestedUrls: [
        `https://drive.google.com/uc?id=${fileId}`,
        `https://drive.google.com/uc?id=${fileId}&export=download`,
        `https://lh3.googleusercontent.com/d/${fileId}`,
        `https://drive.google.com/thumbnail?id=${fileId}`,
      ]
    });

  } catch (error) {
    console.error('Error checking file permissions:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      fileId: fileId
    }, { status: 500 });
  }
}