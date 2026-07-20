import { NextResponse } from "next/server";
import User from "@/models/User";
import { connectDB } from "@/lib/mongodb";
import { verifyAccessToken, verifyRefreshToken } from "@/utils/jwt";

type UserDocument = {
  refreshToken?: string;
  save: () => Promise<unknown>;
} & Record<string, unknown>;

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    // token can come from body, header, or HttpOnly cookie (refreshToken)
    const cookieToken = req.cookies?.get('refreshToken')?.value;
    const authHeader = req.headers.get("authorization");
    const tokenFromHeader = authHeader?.split(' ')[1];
    const tokenFromBody = body?.refreshToken || body?.accessToken;
    const token = tokenFromHeader || tokenFromBody || cookieToken;


    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "No token provided",
        },
        { status: 400 }
      );
    }

    await connectDB();

    let payload: { id?: string } | null = null;
    let isRefreshToken = false;

    try {
      payload = verifyAccessToken(token) as { id?: string };
    } catch {
      try {
        payload = verifyRefreshToken(token) as { id?: string };
        isRefreshToken = true;
      } catch {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid token",
          },
          { status: 401 }
        );
      }
    }

    if (!payload?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid token payload",
        },
        { status: 400 }
      );
    }

    const user = (await User.findById(payload.id)) as UserDocument | null;
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    user.refreshToken = undefined;
    await user.save();

    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
      tokenType: isRefreshToken ? "refresh" : "access",
    });
    // Delete the refresh token cookie
    response.cookies.set('refreshToken', '', { maxAge: 0, path: '/' });
    return response;
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Logout failed";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}