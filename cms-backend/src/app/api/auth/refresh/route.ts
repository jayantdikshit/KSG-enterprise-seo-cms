import { NextResponse } from "next/server";
import { AuthService } from "@/services/AuthService";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { refreshToken } = body;

    const accessToken = await AuthService.refresh(refreshToken);

    return NextResponse.json({
      success: true,
      accessToken,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Token refresh failed";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 401 }
    );
  }
}