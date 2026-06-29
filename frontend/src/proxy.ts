import { NextRequest, NextResponse } from 'next/server';

const PROTECTED = ['/dashboard', '/contacts', '/journeys', '/sos', '/history', '/last-location', '/profile', '/settings'];
const AUTH_ONLY = ['/login', '/register', '/forgot-password'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for token in cookie or Authorization header
  const token = request.cookies.get('st_token')?.value;

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  const isAuthOnly = AUTH_ONLY.some((p) => pathname.startsWith(p));

  if (isProtected && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthOnly && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/contacts/:path*', '/journeys/:path*', '/sos', '/history', '/last-location', '/profile', '/settings', '/login', '/register', '/forgot-password'],
};
