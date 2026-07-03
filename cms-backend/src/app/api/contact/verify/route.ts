import { NextRequest, NextResponse } from "next/server";

async function verifyRecaptcha(token: string) {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  if (!secretKey) {
    return true;
  }
  try {
    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${secretKey}&response=${token}`,
    });
    const result = await response.json();
    return !!result.success;
  } catch (error) {
    console.error("reCAPTCHA validation error:", error);
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "reCAPTCHA token is required" },
        { status: 400 }
      );
    }

    const isValid = await verifyRecaptcha(token);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "reCAPTCHA verification failed" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "reCAPTCHA verification successful",
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Verification failed";
    console.error("[POST /api/contact/verify]", message);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
