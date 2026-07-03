import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/services/AuthService";
import { connectDB } from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const user = await AuthService.register(body);

    return NextResponse.json({
      success: true,
      user,
    });
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