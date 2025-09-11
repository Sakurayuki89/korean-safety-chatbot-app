/**
 * @file app/api/google/files/[fileId]/download/route.ts
 * @description API route to download a specific file from Google Drive.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getOAuth2Client } from '@/lib/google-drive';
import { google } from 'googleapis';
import { GoogleToken } from '@/types/google-drive';

export const dynamic = 'force-dynamic';

const GOOGLE_TOKEN_COOKIE = 'google_token';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ fileId: string }> }
) {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get(GOOGLE_TOKEN_COOKIE)?.value;
  const { fileId } = await context.params;

  if (!tokenCookie) {
    return NextResponse.json({ error: 'User is not authenticated' }, { status: 401 });
  }

  if (!fileId) {
    return NextResponse.json({ error: 'File ID is required' }, { status: 400 });
  }

  try {
    const tokens: GoogleToken = JSON.parse(tokenCookie);
    if (!tokens.access_token) {
      throw new Error('Invalid token stored in cookie');
    }

    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials(tokens);

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    const fileResponse = await drive.files.get(
      { fileId: fileId, alt: 'media' },
      { responseType: 'stream' }
    );

    return new NextResponse(fileResponse.data as unknown as ReadableStream, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="document.pdf"`,
      },
    });

  } catch (error: unknown) {
    const err = error as Error;
    console.error(`Failed to download file ${fileId}:`, err.message);
    return NextResponse.json({ error: 'Failed to download file' }, { status: 500 });
  }
}
