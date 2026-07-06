import { middleware as redirectMiddleware } from './middleware/redirect.middleware';

// Export the combined middleware for Next.js edge runtime.
export const middleware = redirectMiddleware;

export const config = {
  // Apply to all routes; customize matcher if needed.
  matcher: '/:path*',
};
