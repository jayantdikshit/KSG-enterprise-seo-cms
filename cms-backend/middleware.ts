// middleware.ts – protects admin routes
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that do NOT require authentication
const PUBLIC_PATHS = [
  '/admin/login',          // admin login page
  '/login',                // alias
  '/api/auth/login',       // login API
  '/api/auth/logout',
  '/api/auth/refresh',
  '/api/auth/register',
  '/api/auth/seed',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignore static assets, chunks, and Next.js internals
  if (
    pathname.includes('/_next/') ||
    pathname.match(/\.(js|css|png|jpg|jpeg|svg|gif|ico|woff|woff2|ttf|eot)$/) ||
    pathname.includes('src_') || 
    pathname.includes('node_modules')
  ) {
    return NextResponse.next();
  }

  // If the request is for a public path, just continue
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Check for a refresh token cookie (or an access token header)
  const token = request.cookies.get('refreshToken')?.value;

  if (!token) {
    // No token → redirect to admin login page
    const loginUrl = new URL('/admin/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Token exists → allow request to proceed
  return NextResponse.next();
}

// Apply middleware only to admin pages and API routes (exclude static files)
export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};
