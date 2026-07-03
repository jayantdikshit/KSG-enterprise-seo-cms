import { NextRequest, NextResponse } from "next/server";
import { MenuService } from "@/services/MenuService";
import { createMenuSchema } from "@/validators/menu.validator";
import { withApiAuth } from "@/middleware/apiAuth";
import { ZodError } from "zod";

// Force Next.js recompilation for validation updates
export const POST = withApiAuth(async (req, user) => {
  try {
    const body = await req.json();

    // Validate request body
    const validatedData = createMenuSchema.parse(body);

    const ipAddress = req.headers.get("x-forwarded-for") || "unknown";
    const userAgent = req.headers.get("user-agent") || undefined;

    const menu = await MenuService.createMenu(
      validatedData,
      user.id,
      ipAddress,
      userAgent
    );

    return NextResponse.json(
      {
        success: true,
        message: "Menu created successfully",
        data: menu,
      },
      { status: 201 }
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

    const message = error instanceof Error ? error.message : "Failed to create menu";
    
    if (message.includes("already assigned")) {
      return NextResponse.json({ success: false, error: message }, { status: 409 });
    }

    console.error("[POST /api/menus]", message);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}, "PAGES_CREATE");

export async function GET(req: NextRequest) {
  try {
    const menus = await MenuService.getAllMenus();

    return NextResponse.json(
      {
        success: true,
        data: menus,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch menus";
    console.error("[GET /api/menus]", message);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
