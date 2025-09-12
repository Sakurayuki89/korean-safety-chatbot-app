
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_NAME = 'admin-token';

export async function GET() {
  if (!JWT_SECRET) {
    console.error('JWT_SECRET is not set in environment variables.');
    // In this case, we can't verify any token, so the user is not authenticated.
    return NextResponse.json({ isAuthenticated: false });
  }

  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME);

    if (!token) {
      return NextResponse.json({ isAuthenticated: false });
    }

    // Verify the token
    jwt.verify(token.value, JWT_SECRET);

    // If verification is successful, the user is authenticated
    return NextResponse.json({ isAuthenticated: true });

  } catch (error) {
    // If verification fails (e.g., token expired, invalid signature), the user is not authenticated.
    console.log('Auth status check failed:', error);
    return NextResponse.json({ isAuthenticated: false });
  }
}
