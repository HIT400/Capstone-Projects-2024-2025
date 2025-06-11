// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('userRole')?.value;
  const { pathname } = request.nextUrl;

  // Protected routes
  const protectedRoutes = ['/dashboard', '/admin', '/inspector', '/applicant'];
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route));

  // If trying to access a protected route without a token, redirect to login
  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Role-specific access control
  if (isProtected && token && role) {
    // Admin routes - accessible by admins and superadmins
    if (pathname.startsWith('/admin') && role !== 'admin' && role !== 'superadmin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    // Inspector routes - only accessible by inspectors
    if (pathname.startsWith('/inspector') && role !== 'inspector') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    // Applicant routes - only accessible by applicants
    if (pathname.startsWith('/applicant') && role !== 'applicant') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    // Generic dashboard route redirects to role-specific dashboard
    if (pathname === '/dashboard') {
      return NextResponse.redirect(new URL(`/${role}`, request.url));
    }
  }

  return NextResponse.next();
}

// Add config to specify which paths this middleware should run on
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/inspector/:path*',
    '/applicant/:path*',
    // Include the route group paths
    '/(dashboard)/admin/:path*',
    '/(dashboard)/inspector/:path*',
    '/(dashboard)/applicant/:path*'
  ]
}
