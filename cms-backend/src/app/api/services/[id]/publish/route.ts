import { NextRequest, NextResponse } from "next/server";
import { ServiceService } from "@/services/ServiceService";
import { withApiAuth } from "@/middleware/apiAuth";

export const PATCH = withApiAuth(async (req, user, context) => {
  try {
    const { id } = await context.params;

    const ipAddress = req.headers.get("x-forwarded-for") || "unknown";
    const userAgent = req.headers.get("user-agent") || undefined;

    const published = await ServiceService.publishService(
      id,
      user.id,
      ipAddress,
      userAgent
    );

    return NextResponse.json(
      {
        success: true,
        message: "Service published successfully",
        data: published,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to publish service";

    if (message.includes("not found")) {
      return NextResponse.json({ success: false, error: "Service not found" }, { status: 404 });
    }

    console.error("[PATCH /api/services/[id]/publish]", message);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}, "SERVICES_UPDATE");
export async function GET() {
  return NextResponse.json(
    { success: false, error: "Method Not Allowed" },
    { status: 405 }
  );
}
export async function POST() {
  return NextResponse.json(
    { success: false, error: "Method Not Allowed" },
    { status: 405 }
  );
}
