import { NextResponse } from "next/server";
import { generateCsrfToken, setCsrfCookie } from "@/lib/csrf";

/**
 * GET /api/auth/csrf
 *
 * Returns a fresh CSRF token.
 * The token is also set as a cookie (non-HttpOnly) for the double-submit pattern.
 * The frontend should call this endpoint before making mutating requests,
 * store the token, and include it in the X-CSRF-Token header.
 */
export async function GET() {
  const token = generateCsrfToken();

  const response = NextResponse.json({
    success: true,
    csrfToken: token,
  });

  setCsrfCookie(response, token);

  return response;
}
