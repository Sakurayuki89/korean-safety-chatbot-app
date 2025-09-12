
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'admin-token';

export async function POST() {
  try {
    // Clear the cookie by setting its maxAge to 0
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 0,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: '로그아웃 처리 중 오류 발생' }, { status: 500 });
  }
}
