// middleware.ts – protects admin routes, allows public website routes,
// enforces HTTPS in production, and injects security headers on all responses.
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

/**
 * Inject security headers onto a NextResponse.
 *
 * These replace the Express `helmet` middleware which does NOT work
 * with Next.js edge/serverless runtime.
 */
function applySecurityHeaders(response: NextResponse): NextResponse {
  // Prevent the page from being embedded in iframes (clickjacking defense)
  response.headers.set('X-Frame-Options', 'DENY');

  // Prevent MIME-type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Enable XSS filter in older browsers
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Referrer policy — send origin only on cross-origin, full on same-origin
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Prevent DNS prefetching to third parties
  response.headers.set('X-DNS-Prefetch-Control', 'off');

  // Disable Adobe Flash/PDF cross-domain access
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');

  // Content Security Policy — restrictive but practical
  // Allows: self, inline scripts/styles (needed for Next.js), Cloudinary images,
  // Google Analytics, Google Tag Manager, Google reCAPTCHA
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://www.gstatic.com https://www.google.com https://www.recaptcha.net",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' https: data: blob:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com https://vitals.vercel-insights.com https://www.google.com https://www.recaptcha.net",
      "frame-src 'self' https://www.google.com https://www.gstatic.com https://www.recaptcha.net https://maps.google.com https://maps.googleapis.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  );

  // Strict Transport Security — tell browsers to only use HTTPS for 1 year
  // includeSubDomains and preload for maximum security
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  // Permissions Policy — disable unnecessary browser features
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );

  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ──────────────────────────────────────────────────────────────────────
  // 1. HTTPS Enforcement (production only)
  // ──────────────────────────────────────────────────────────────────────
  if (process.env.NODE_ENV === 'production') {
    const proto = request.headers.get('x-forwarded-proto');
    if (proto && proto !== 'https') {
      const httpsUrl = new URL(request.url);
      httpsUrl.protocol = 'https:';
      return NextResponse.redirect(httpsUrl, 301);
    }
  }

  // ──────────────────────────────────────────────────────────────────────
  // 2. Ignore static assets, chunks, and Next.js internals
  // ──────────────────────────────────────────────────────────────────────
  if (
    pathname.includes('/_next/') ||
    pathname.match(/\.(js|css|png|jpg|jpeg|svg|gif|ico|woff|woff2|ttf|eot)$/) ||
    pathname.includes('src_') || 
    pathname.includes('node_modules')
  ) {
    return NextResponse.next();
  }

  // ──────────────────────────────────────────────────────────────────────
  // 3. Public API routes — no auth needed (for public website data fetching)
  // ──────────────────────────────────────────────────────────────────────
  if (pathname.startsWith('/api/public')) {
    const response = NextResponse.next();
    return applySecurityHeaders(response);
  }

  // ──────────────────────────────────────────────────────────────────────
  // 4. Public website routes — no auth needed
  //    Everything that is NOT /admin or /api is a public website page
  // ──────────────────────────────────────────────────────────────────────
  if (!pathname.startsWith('/admin') && !pathname.startsWith('/api')) {
    const response = NextResponse.next();
    return applySecurityHeaders(response);
  }

  // ──────────────────────────────────────────────────────────────────────
  // 5. If the request is for a public path (admin login, auth APIs), just continue
  // ──────────────────────────────────────────────────────────────────────
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    const response = NextResponse.next();
    return applySecurityHeaders(response);
  }

  // ──────────────────────────────────────────────────────────────────────
  // 6. Contact form API — public but with security headers
  // ──────────────────────────────────────────────────────────────────────
  if (pathname.startsWith('/api/contact')) {
    const response = NextResponse.next();
    return applySecurityHeaders(response);
  }

  // ──────────────────────────────────────────────────────────────────────
  // 7. Protected admin routes — check for auth token
  // ──────────────────────────────────────────────────────────────────────
  const token = request.cookies.get('refreshToken')?.value;

  if (!token) {
    // No token → redirect to admin login page
    const loginUrl = new URL('/admin/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Token exists → allow request to proceed with security headers
  const response = NextResponse.next();
  return applySecurityHeaders(response);
}

// Apply middleware to all routes (public routes are handled above with early returns)
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
