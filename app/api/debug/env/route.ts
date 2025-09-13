import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasJwtSecret: !!process.env.JWT_SECRET,
    hasAdminPassword: !!process.env.ADMIN_PASSWORD,
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
}