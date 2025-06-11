// app/api/auth/set-cookies/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { role } = await request.json();
  const token = request.headers.get('Authorization')?.split(' ')[1];

  if (!token || !role) {
    return NextResponse.json(
      { error: 'Missing token or role' },
      { status: 400 }
    );
  }

  const response = NextResponse.json({ success: true });

  response.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
  });

  response.cookies.set('userRole', role, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
  });

  return response;
}