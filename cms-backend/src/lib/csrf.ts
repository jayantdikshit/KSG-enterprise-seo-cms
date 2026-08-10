/**
 * CSRF Protection for Next.js API Routes
 *
 * Implements the Double-Submit Cookie pattern:
 * 1. Server generates a random CSRF token
 * 2. Token is set as an HttpOnly cookie AND returned in the response body
 * 3. Client must include the token in the `X-CSRF-Token` header on subsequent requests
 * 4. Server validates that the header token matches the cookie token
 *
 * Usage:
 *   // Generate token (e.g., on login or on a GET /api/csrf endpoint):
 *   import { generateCsrfToken, setCsrfCookie } from '@/lib/csrf';
 *   const token = generateCsrfToken();
 *   const response = NextResponse.json({ csrfToken: token });
 *   setCsrfCookie(response, token);
 *
 *   // Validate token (in mutating endpoints):
 *   import { validateCsrf } from '@/lib/csrf';
 *   const csrfError = validateCsrf(req);
 *   if (csrfError) return csrfError;
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

/** Cookie name for the CSRF token */
const CSRF_COOKIE_NAME = "csrf-token";

/** Header name the client must send the token in */
const CSRF_HEADER_NAME = "x-csrf-token";

/** Token length in bytes (32 bytes = 64 hex chars) */
const TOKEN_LENGTH = 32;

/**
 * Generate a cryptographically secure random CSRF token.
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(TOKEN_LENGTH).toString("hex");
}

/**
 * Set the CSRF token as a cookie on the response.
 *
 * The cookie is:
 * - NOT HttpOnly (so JavaScript can read it for the double-submit pattern)
 * - SameSite=Strict (prevents cross-site request forgery)
 * - Secure in production
 * - Path=/
 */
export function setCsrfCookie(response: NextResponse, token: string): void {
  const isProduction = process.env.NODE_ENV === "production";

  response.cookies.set(CSRF_COOKIE_NAME, token, {
    httpOnly: false, // Client needs to read this
    secure: isProduction,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  });
}

/**
 * Validate the CSRF token on an incoming request.
 *
 * Checks that:
 * 1. The CSRF cookie exists
 * 2. The X-CSRF-Token header exists
 * 3. They match (timing-safe comparison)
 *
 * @param req The incoming NextRequest
 * @returns `null` if valid, or a `NextResponse` (403) if invalid
 */
export function validateCsrf(req: NextRequest): NextResponse | null {
  // Skip CSRF validation in development if explicitly disabled
  if (
    process.env.NODE_ENV === "development" &&
    process.env.CSRF_DISABLED === "true"
  ) {
    return null;
  }

  const cookieToken = req.cookies.get(CSRF_COOKIE_NAME)?.value;
  const headerToken = req.headers.get(CSRF_HEADER_NAME);

  // Both must be present
  if (!cookieToken || !headerToken) {
    return NextResponse.json(
      {
        success: false,
        error: "CSRF token missing. Include the CSRF token in the X-CSRF-Token header.",
      },
      { status: 403 }
    );
  }

  // Timing-safe comparison to prevent timing attacks
  let isValid = false;
  try {
    const cookieBuffer = Buffer.from(cookieToken, "utf-8");
    const headerBuffer = Buffer.from(headerToken, "utf-8");

    if (cookieBuffer.length === headerBuffer.length) {
      isValid = crypto.timingSafeEqual(cookieBuffer, headerBuffer);
    }
  } catch {
    isValid = false;
  }

  if (!isValid) {
    return NextResponse.json(
      {
        success: false,
        error: "CSRF token mismatch. Request rejected.",
      },
      { status: 403 }
    );
  }

  return null; // Valid
}

/**
 * CSRF constants exported for use in client-side code.
 */
export const CSRF_CONSTANTS = {
  COOKIE_NAME: CSRF_COOKIE_NAME,
  HEADER_NAME: CSRF_HEADER_NAME,
} as const;
