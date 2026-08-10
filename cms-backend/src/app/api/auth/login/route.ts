
import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/AuthService';
import { loginRateLimiter } from '@/lib/rateLimit';
import { generateCsrfToken, setCsrfCookie } from '@/lib/csrf';



/**
 * GET – simple health‑check for the login endpoint.
 * Allows browsing to /api/auth/login in a browser without a 404.
 */
export const GET = async (_req: NextRequest) => {
  return NextResponse.json({
    success: true,
    message: "Login endpoint is reachable. Use POST with { email, password } to authenticate.",
  });
};

/**
 * POST – authenticate user and set HttpOnly refresh token cookie.
 * Rate-limited: 5 attempts per 15 minutes per IP.
 */
export const POST = async (req: NextRequest) => {
  try {
    // ── Rate Limit Check ──────────────────────────────────────────────
    const rateLimitResponse = loginRateLimiter.check(req);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Guard: if a valid refresh token cookie exists, attempt to refresh and return
    const existingToken = req.cookies.get('refreshToken')?.value;
    if (existingToken) {
      try {
        const refreshed = await AuthService.refresh(existingToken);
        return NextResponse.json({ success: true, data: refreshed });
      } catch (_) {
        // Invalid/expired token – proceed with normal login
      }
    }

    const rawBody = await req.text();
    let body: any;
    try {
      // Try normal JSON parsing
      body = JSON.parse(rawBody);
    } catch (_) {
      // Fallback: handle double‑escaped JSON string (e.g., "{\"email\":...}")
      try {
        const inner = JSON.parse(rawBody);
        body = JSON.parse(inner);
      } catch (e2) {
        console.error('Unable to parse login request body', e2);
        return NextResponse.json({ success: false, message: 'Invalid JSON payload' }, { status: 400 });
      }
    }
    const { email, password } = body;
    const data = await AuthService.login(email, password);
    console.log('✅ Login success, data:', data);

    // ── Generate CSRF token on successful login ─────────────────────
    const csrfToken = generateCsrfToken();

    // Return fields in a shape the client expects (top‑level accessToken & user)
    const response = NextResponse.json({
      success: true,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: data.user,
      csrfToken, // Client stores this and sends it in X-CSRF-Token header
    });

    // Set HttpOnly refresh token cookie (secure flag in production)
    const isProduction = process.env.NODE_ENV === 'production';
    response.cookies.set('refreshToken', data.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      sameSite: 'lax',
    });

    // Set CSRF cookie (readable by JavaScript for double-submit pattern)
    setCsrfCookie(response, csrfToken);

    // Add rate limit info headers to the response
    const rateLimitHeaders = loginRateLimiter.getHeaders(req);
    for (const [key, value] of Object.entries(rateLimitHeaders)) {
      response.headers.set(key, value);
    }

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Login failed";
    console.error('❌ Login error:', error);
    return NextResponse.json({ success: false, message }, { status: 401 });
  }
};