/**
 * @file app/api/google/files/route.ts
 * @description API route to list files from the user's Google Drive.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { listFiles } from '@/lib/google-drive';
import { GoogleToken } from '@/types/google-drive';

export const dynamic = 'force-dynamic';

const GOOGLE_TOKEN_COOKIE = 'google_token';

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get(GOOGLE_TOKEN_COOKIE)?.value;

  if (!tokenCookie) {
    return NextResponse.json({ error: 'User is not authenticated' }, { status: 401 });
  }

  try {
    const tokens: GoogleToken = JSON.parse(tokenCookie);
    if (!tokens.access_token) {
      throw new Error('Invalid token stored in cookie');
    }

    const { searchParams } = new URL(req.url);
    const pageSize = searchParams.get('pageSize') ? parseInt(searchParams.get('pageSize')!, 10) : 20;
    const pageToken = searchParams.get('pageToken') || undefined;

    const filesData = await listFiles(tokens.access_token, {
      pageSize,
      pageToken,
      q: "mimeType='application/pdf' and trashed=false",
    });

    return NextResponse.json(filesData);

  } catch (error: unknown) {
    const err = error as Error;
    console.error('Failed to fetch files from Google Drive:', err.message);
    return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 });
  }
}
