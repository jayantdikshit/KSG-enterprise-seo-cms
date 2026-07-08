import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "../../../../services/AuthService";

export const runtime = 'nodejs';

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

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { email, password } = body;
    const data = await AuthService.login(email, password);
    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Login failed";
    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 401 }
    );
  }
};