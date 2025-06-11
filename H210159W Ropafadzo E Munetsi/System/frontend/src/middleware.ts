// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('userRole')?.value;
  const { pathname } = request.nextUrl;

  // Log cookie information for debugging
  console.log('Middleware running for path:', pathname);
  console.log('Token cookie present:', !!token);
  console.log('Role cookie present:', !!role);

  // Get all cookies for debugging
  const allCookies = request.cookies.getAll();
  console.log('All cookies:', allCookies.map(c => c.name));

  // Protected routes
  const protectedRoutes = ['/dashboard', '/admin', '/inspector', '/applicant'];
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route));
  console.log('Is protected route:', isProtected);

  // If trying to access a protected route without a token, redirect to login
  if (isProtected && !token) {
    console.log('Redirecting to login page due to missing token');
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Role-specific access control
  if (isProtected && token && role) {
    console.log('Checking role-specific access for role:', role);

    // Admin routes - accessible by admins and superadmins
    if (pathname.startsWith('/admin') && role !== 'admin' && role !== 'superadmin') {
      console.log('Unauthorized access to admin route with role:', role);
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    // Inspector routes - only accessible by inspectors
    if (pathname.startsWith('/inspector') && role !== 'inspector') {
      console.log('Unauthorized access to inspector route with role:', role);
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    // Applicant routes - only accessible by applicants
    if (pathname.startsWith('/applicant') && role !== 'applicant') {
      console.log('Unauthorized access to applicant route with role:', role);
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    // Generic dashboard route redirects to role-specific dashboard
    if (pathname === '/dashboard') {
      console.log('Redirecting from generic dashboard to role-specific dashboard:', role);
      return NextResponse.redirect(new URL(`/${role}`, request.url));
    }

    console.log('Access granted for path:', pathname);
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
