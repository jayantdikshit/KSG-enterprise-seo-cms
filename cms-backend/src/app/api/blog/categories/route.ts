import { NextRequest, NextResponse } from "next/server";
import { CategoryService } from "@/services/CategoryService";
import { createCategorySchema } from "@/validators/category.validator";
import { withApiAuth } from "@/middleware/apiAuth";
import { ZodError } from "zod";

export const POST = withApiAuth(async (req, user) => {
  try {
    const body = await req.json();

    // Validate request body
    const validatedData = createCategorySchema.parse(body);

    const ipAddress = req.headers.get("x-forwarded-for") || "unknown";
    const userAgent = req.headers.get("user-agent") || undefined;

    const category = await CategoryService.createCategory(
      validatedData,
      user.id,
      ipAddress,
      userAgent
    );

    return NextResponse.json(
      {
        success: true,
        message: "Category created successfully",
        data: category,
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

    const message = error instanceof Error ? error.message : "Failed to create category";
    
    if (message.includes("already exists")) {
      return NextResponse.json({ success: false, error: message }, { status: 409 });
    }

    console.error("[POST /api/blog/categories]", message);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}, "BLOGS_CREATE");

export async function GET(req: NextRequest) {
  try {
    const categories = await CategoryService.getAllCategories();

    return NextResponse.json(
      {
        success: true,
        data: categories,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch categories";
    console.error("[GET /api/blog/categories]", message);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
