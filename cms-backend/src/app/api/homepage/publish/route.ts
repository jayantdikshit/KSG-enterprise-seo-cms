import { NextRequest, NextResponse } from "next/server";
import { HomePageService } from "@/services/HomePageService";
import { withApiAuth } from "@/middleware/apiAuth";

export const PATCH = withApiAuth(async (req, user) => {
  try {
    const ipAddress = req.headers.get("x-forwarded-for") || "unknown";
    const userAgent = req.headers.get("user-agent") || undefined;

    const homepage = await HomePageService.publishHomePage(
      user.id,
      ipAddress,
      userAgent
    );

    return NextResponse.json(
      {
        success: true,
        message: "Homepage published successfully",
        data: {
          _id: homepage._id,
          status: (homepage as any).status,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to publish homepage";

    if (message.includes("not found")) {
      return NextResponse.json({ success: false, error: "Homepage not found" }, { status: 404 });
    }

    console.error("[PATCH /api/homepage/publish]", message);
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
