
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '7930';
const JWT_SECRET = process.env.JWT_SECRET || 'b7e8f9g2h3i4j5k6l7m8n9p0q1r2s3t4u5v6w7x8y9z0a1b2c3d4e5f6';
const COOKIE_NAME = 'admin-token';

export async function POST(request: Request) {
  if (!ADMIN_PASSWORD || !JWT_SECRET) {
    console.error('ADMIN_PASSWORD or JWT_SECRET is not set in environment variables.');
    return NextResponse.json({ error: '서버 설정 오류' }, { status: 500 });
  }

  try {
    const { password } = await request.json();

    // Use a simple string comparison. For high-security, use a timing-safe comparison.
    if (password === ADMIN_PASSWORD) {
      // Password is correct, create a JWT
      const token = jwt.sign(
        { isAdmin: true, iat: Math.floor(Date.now() / 1000) },
        JWT_SECRET,
        { expiresIn: '8h' } // Token expires in 8 hours
      );

      // Set the token in an HttpOnly cookie
      const cookieStore = await cookies();
      cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 8, // 8 hours
      });

      return NextResponse.json({ success: true }, { status: 200 });
    } else {
      // Password is incorrect
      return NextResponse.json({ error: '비밀번호가 올바르지 않습니다.' }, { status: 401 });
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: '로그인 처리 중 오류 발생' }, { status: 500 });
  }
}
