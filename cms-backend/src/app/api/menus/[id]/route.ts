import { NextRequest, NextResponse } from "next/server";
import { MenuService } from "@/services/MenuService";
import { updateMenuSchema } from "@/validators/menu.validator";
import { withApiAuth } from "@/middleware/apiAuth";
import { ZodError } from "zod";

// Force Next.js recompilation for populate schemas
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const menu = await MenuService.getMenuById(id);

    return NextResponse.json(
      {
        success: true,
        data: menu,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch menu";
    
    if (message.includes("not found")) {
      return NextResponse.json({ success: false, error: "Menu not found" }, { status: 404 });
    }

    console.error("[GET /api/menus/[id]]", message);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export const PUT = withApiAuth(async (req, user, context) => {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const validatedData = updateMenuSchema.parse(body);

    const ipAddress = req.headers.get("x-forwarded-for") || "unknown";
    const userAgent = req.headers.get("user-agent") || undefined;

    const updated = await MenuService.updateMenu(
      id,
      validatedData,
      user.id,
      ipAddress,
      userAgent
    );

    return NextResponse.json(
      {
        success: true,
        message: "Menu updated successfully",
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

    const message = error instanceof Error ? error.message : "Failed to update menu";
    
    if (message.includes("not found")) {
      return NextResponse.json({ success: false, error: "Menu not found" }, { status: 404 });
    }
    
    if (message.includes("already assigned")) {
      return NextResponse.json({ success: false, error: message }, { status: 409 });
    }

    console.error("[PUT /api/menus/[id]]", message);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}, "PAGES_UPDATE");

export const DELETE = withApiAuth(async (req, user, context) => {
  try {
    const { id } = await context.params;

    const ipAddress = req.headers.get("x-forwarded-for") || "unknown";
    const userAgent = req.headers.get("user-agent") || undefined;

    const deleted = await MenuService.deleteMenu(
      id,
      user.id,
      ipAddress,
      userAgent
    );

    return NextResponse.json(
      {
        success: true,
        message: "Menu deleted successfully",
        data: deleted,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete menu";

    if (message.includes("not found")) {
      return NextResponse.json({ success: false, error: "Menu not found" }, { status: 404 });
    }

    console.error("[DELETE /api/menus/[id]]", message);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}, "PAGES_DELETE");
