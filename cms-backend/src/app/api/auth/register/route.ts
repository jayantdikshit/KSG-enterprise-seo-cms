import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/services/AuthService";
import { connectDB } from "@/lib/mongodb";
import { registerRateLimiter } from "@/lib/rateLimit";

/**
 * POST – register a new user.
 * Rate-limited: 3 attempts per 60 minutes per IP.
 */
export async function POST(req: NextRequest) {
  try {
    // ── Rate Limit Check ──────────────────────────────────────────────
    const rateLimitResponse = registerRateLimiter.check(req);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    await connectDB();
    const body = await req.json();

    const user = await AuthService.register(body);

    const response = NextResponse.json({
      success: true,
      user,
    });

    // Add rate limit info headers to the response
    const rateLimitHeaders = registerRateLimiter.getHeaders(req);
    for (const [key, value] of Object.entries(rateLimitHeaders)) {
      response.headers.set(key, value);
    }

    return response;
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Registration failed";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 400 }
    );
  }
}