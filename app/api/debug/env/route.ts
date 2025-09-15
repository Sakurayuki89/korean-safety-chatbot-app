import { NextResponse } from 'next/server';

// 🚨 SECURITY NOTICE: This endpoint has been disabled for production security
// The debug endpoint exposed sensitive environment variable values
export async function GET() {
  return NextResponse.json({
    success: false,
    message: 'Debug endpoints have been permanently disabled for security reasons'
  }, { status: 404 });
}