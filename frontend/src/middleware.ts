import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('nexacare_token')?.value;
  const role = request.cookies.get('nexacare_role')?.value;
  const { pathname } = request.nextUrl;

  // Protect /dashboard and all sub-routes (Doctor Portal)
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Role based access:
    // /dashboard/forecast -> admin only
    if (pathname.startsWith('/dashboard/forecast') && role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Protect /patient-portal (but not /patient-portal/login)
  if (pathname.startsWith('/patient-portal') && !pathname.startsWith('/patient-portal/login')) {
    if (!token) {
      return NextResponse.redirect(new URL('/patient-portal/login', request.url));
    }
  }

  // If visiting /login with token -> redirect to appropriate dashboard
  if (pathname.startsWith('/login')) {
    if (token) {
      if (role === 'patient') {
        return NextResponse.redirect(new URL('/patient-portal', request.url));
      }
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // If visiting /patient-portal/login with token -> redirect to patient portal
  if (pathname === '/patient-portal/login') {
    if (token) {
      return NextResponse.redirect(new URL('/patient-portal', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/patient-portal/:path*'],
};
