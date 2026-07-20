import { NextRequest, NextResponse } from "next/server";
import { PageService } from "@/services/PageService";
import { createPageSchema } from "@/validators/page.validator";
import { withApiAuth } from "@/middleware/apiAuth";
import { ZodError } from "zod";

export const POST = withApiAuth(async (req, user) => {
  try {
    const body = await req.json();

    // Validate input
    const validatedData = createPageSchema.parse(body);

    const ipAddress = req.headers.get("x-forwarded-for") || "unknown";
    const userAgent = req.headers.get("user-agent") || undefined;

    const page = await PageService.createPage(validatedData, user.id, ipAddress, userAgent);

    return NextResponse.json(
      {
        success: true,
        message: "Page created successfully",
        data: page,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : "Internal server error";

    if (errorMessage.includes("already exists")) {
      return NextResponse.json({ success: false, error: errorMessage }, { status: 409 });
    }

    console.error("[POST /api/pages]", errorMessage);
    return NextResponse.json({ success: false, error: "Failed to create page" }, { status: 500 });
  }
}, "PAGES_CREATE");

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") || undefined;

    // Validate pagination params
    if (page < 1 || limit < 1 || limit > 1000) {
      return NextResponse.json(
        { success: false, error: "Invalid pagination parameters" },
        { status: 400 }
      );
    }

    const result = await PageService.getAllPages(page, limit, search, status);

    return NextResponse.json(
      {
        success: true,
        data: result.data,
        pagination: result.pagination,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";

   console.error("FULL ERROR:", error);

return NextResponse.json(
  {
    success: false,
    error: error instanceof Error ? error.message : "Unknown error",
  },
  { status: 500 }
);
  }
}
