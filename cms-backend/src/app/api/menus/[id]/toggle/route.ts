import { NextRequest, NextResponse } from "next/server";
import { MenuService } from "@/services/MenuService";
import { toggleItemSchema } from "@/validators/menu.validator";
import { withApiAuth } from "@/middleware/apiAuth";
import { ZodError } from "zod";

export const PATCH = withApiAuth(async (req, user, context) => {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const validatedData = toggleItemSchema.parse(body);

    const ipAddress = req.headers.get("x-forwarded-for") || "unknown";
    const userAgent = req.headers.get("user-agent") || undefined;

    const updated = await MenuService.toggleMenuItem(
      id,
      validatedData.itemId,
      validatedData.isActive,
      user.id,
      ipAddress,
      userAgent
    );

    return NextResponse.json(
      {
        success: true,
        message: `Menu item ${validatedData.isActive ? "enabled" : "disabled"} successfully`,
        data: updated,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    const message = error instanceof Error ? error.message : "Failed to toggle menu item";

    if (message.includes("not found")) {
      return NextResponse.json({ success: false, error: message }, { status: 404 });
    }

    console.error("[PATCH /api/menus/[id]/toggle]", message);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}, "PAGES_UPDATE");

export async function GET() {
  return NextResponse.json({ success: false, error: "Method Not Allowed" }, { status: 405 });
}
export async function POST() {
  return NextResponse.json({ success: false, error: "Method Not Allowed" }, { status: 405 });
}
