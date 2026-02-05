import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from './lib/auth';

const intlMiddleware = createMiddleware({
  locales: ['en', 'lo'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
});

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public paths that don't require authentication
  const publicPaths = ['/login', '/register', '/api/auth'];
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  // Handle internationalization
  const response = intlMiddleware(request);

  // Skip auth check for public paths
  if (isPublicPath) {
    return response;
  }

  // Check authentication
  const session = await auth();

  if (!session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check if user is active
  if (!session.user.active) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Check admin routes
  if (pathname.startsWith('/admin') && session.user.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next|api/auth|.*\\..*).*)'],
};
