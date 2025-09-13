import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasJwtSecret: !!process.env.JWT_SECRET,
    hasAdminPassword: !!process.env.ADMIN_PASSWORD,
    hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
    hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    hasGoogleRedirectUri: !!process.env.GOOGLE_REDIRECT_URI,
    googleRedirectUri: process.env.GOOGLE_REDIRECT_URI || 'NOT_SET',
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
}