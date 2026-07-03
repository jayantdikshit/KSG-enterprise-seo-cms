import { NextRequest, NextResponse } from "next/server";
import { PageService } from "@/services/PageService";
import { updatePageSchema } from "@/validators/page.validator";
import { withApiAuth } from "@/middleware/apiAuth";
import { ZodError } from "zod";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const page = await PageService.getPageById(id);

    return NextResponse.json(
      {
        success: true,
        data: page,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";

    if (errorMessage.includes("not found")) {
      return NextResponse.json(
        { success: false, error: "Page not found" },
        { status: 404 }
      );
    }

    console.error("[GET /api/pages/[id]]", errorMessage);
    return NextResponse.json(
      { success: false, error: "Failed to fetch page" },
      { status: 500 }
    );
  }
}

export const PUT = withApiAuth(async (req, user, context) => {
  try {
    const { id } = await context.params;
    const body = await req.json();

    // Validate input
    const validatedData = updatePageSchema.parse(body);

    const ipAddress = req.headers.get("x-forwarded-for") || "unknown";
    const userAgent = req.headers.get("user-agent") || undefined;

    const updatedPage = await PageService.updatePage(
      id,
      validatedData,
      user.id,
      ipAddress,
      userAgent
    );

    return NextResponse.json(
      {
        success: true,
        message: "Page updated successfully",
        data: updatedPage,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : "Internal server error";

    if (errorMessage.includes("not found")) {
      return NextResponse.json({ success: false, error: "Page not found" }, { status: 404 });
    }

    if (errorMessage.includes("already exists")) {
      return NextResponse.json({ success: false, error: errorMessage }, { status: 409 });
    }

    console.error("[PUT /api/pages/[id]]", errorMessage);
    return NextResponse.json({ success: false, error: "Failed to update page" }, { status: 500 });
  }
}, "PAGES_UPDATE");

export const DELETE = withApiAuth(async (req, user, context) => {
  try {
    const { id } = await context.params;

    const ipAddress = req.headers.get("x-forwarded-for") || "unknown";
    const userAgent = req.headers.get("user-agent") || undefined;

    const deletedPage = await PageService.deletePage(
      id,
      user.id,
      ipAddress,
      userAgent
    );

    return NextResponse.json(
      {
        success: true,
        message: "Page deleted successfully",
        data: deletedPage,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Internal server error";

    if (errorMessage.includes("not found")) {
      return NextResponse.json({ success: false, error: "Page not found" }, { status: 404 });
    }

    console.error("[DELETE /api/pages/[id]]", errorMessage);
    return NextResponse.json({ success: false, error: "Failed to delete page" }, { status: 500 });
  }
}, "PAGES_DELETE");
