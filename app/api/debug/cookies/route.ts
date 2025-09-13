import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    url: req.url,
    cookies: Object.fromEntries(
      allCookies.map(cookie => [cookie.name, cookie.value])
    ),
    cookieCount: allCookies.length,
    headers: Object.fromEntries(req.headers.entries()),
    userAgent: req.headers.get('user-agent')
  });
}