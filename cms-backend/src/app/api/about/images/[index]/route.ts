import { NextRequest, NextResponse } from "next/server";
import { AboutService } from "@/services/AboutService";
import { withApiAuth } from "@/middleware/apiAuth";

export const DELETE = withApiAuth(async (req, user, context) => {
  try {
    const { index } = await context.params;
    const imgIndex = parseInt(index, 10);

    if (isNaN(imgIndex)) {
      return NextResponse.json({ success: false, error: "Invalid image index" }, { status: 400 });
    }

    const ipAddress = req.headers.get("x-forwarded-for") || "unknown";
    const userAgent = req.headers.get("user-agent") || undefined;

    const updated = await AboutService.deleteImage(
      imgIndex,
      user.id,
      ipAddress,
      userAgent
    );

    return NextResponse.json(
      {
        success: true,
        message: "About page image deleted successfully",
        data: updated,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete image";

    if (message.includes("not found")) {
      return NextResponse.json({ success: false, error: "About page not found" }, { status: 404 });
    }
    if (message.includes("Invalid image index")) {
      return NextResponse.json({ success: false, error: message }, { status: 400 });
    }

    console.error("[DELETE /api/about/images/[index]]", message);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}, "PAGES_UPDATE");

export async function GET() {
  return NextResponse.json({ success: false, error: "Method Not Allowed" }, { status: 405 });
}
export async function POST() {
  return NextResponse.json({ success: false, error: "Method Not Allowed" }, { status: 405 });
}
export async function PUT() {
  return NextResponse.json({ success: false, error: "Method Not Allowed" }, { status: 405 });
}
