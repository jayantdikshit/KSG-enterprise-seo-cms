import { NextRequest, NextResponse } from "next/server";
import { CategoryService } from "@/services/CategoryService";
import { updateCategorySchema } from "@/validators/category.validator";
import { withApiAuth } from "@/middleware/apiAuth";
import { ZodError } from "zod";

export const PUT = withApiAuth(async (req, user, context) => {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const validatedData = updateCategorySchema.parse(body);

    const ipAddress = req.headers.get("x-forwarded-for") || "unknown";
    const userAgent = req.headers.get("user-agent") || undefined;

    const updated = await CategoryService.updateCategory(
      id,
      validatedData,
      user.id,
      ipAddress,
      userAgent
    );

    return NextResponse.json(
      {
        success: true,
        message: "Category updated successfully",
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

    const message = error instanceof Error ? error.message : "Failed to update category";
    
    if (message.includes("not found")) {
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 });
    }
    
    if (message.includes("already exists")) {
      return NextResponse.json({ success: false, error: message }, { status: 409 });
    }

    console.error("[PUT /api/blog/categories/[id]]", message);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}, "BLOGS_UPDATE");

export const DELETE = withApiAuth(async (req, user, context) => {
  try {
    const { id } = await context.params;

    const ipAddress = req.headers.get("x-forwarded-for") || "unknown";
    const userAgent = req.headers.get("user-agent") || undefined;

    const deleted = await CategoryService.deleteCategory(
      id,
      user.id,
      ipAddress,
      userAgent
    );

    return NextResponse.json(
      {
        success: true,
        message: "Category deleted successfully",
        data: deleted,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete category";

    if (message.includes("not found")) {
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 });
    }

    if (message.includes("associated")) {
      return NextResponse.json({ success: false, error: message }, { status: 400 });
    }

    console.error("[DELETE /api/blog/categories/[id]]", message);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}, "BLOGS_DELETE");

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const params = await context.params;
    const { id } = params;

    const category = await CategoryService.getCategoryById(id);

    return NextResponse.json(
      {
        success: true,
        data: category,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch category";

    if (message.includes("not found")) {
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 });
    }

    console.error("[GET /api/blog/categories/[id]]", message);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
