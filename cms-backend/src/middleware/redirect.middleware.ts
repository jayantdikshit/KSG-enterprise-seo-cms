import RedirectModel from '../models/Redirect';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware that checks the Redirect collection for a matching sourcePath.
 * If found, performs a 301 or 302 redirect based on the stored statusCode.
 */
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const redirect = await RedirectModel.findOne({ sourcePath: pathname, active: true }).lean();
  if (redirect) {
    const destination = redirect.targetPath.startsWith('http')
      ? redirect.targetPath
      : `${process.env.BASE_URL || ''}${redirect.targetPath}`;
    const response = NextResponse.redirect(new URL(destination, request.url), redirect.statusCode);
    // Prevent caching so that changes propagate quickly
    response.headers.set('Cache-Control', 'no-store');
    return response;
  }
  return NextResponse.next();
}

export const config = {
  // Run for every request (or narrow it down if desired).
  matcher: '/:path*',
};
