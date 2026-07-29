import { NextRequest, NextResponse } from "next/server";
import { ProductService } from "@/services/ProductService";
import { updateProductSchema } from "@/validators/product.validator";
import { withApiAuth } from "@/middleware/apiAuth";
import { ZodError } from "zod";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await ProductService.getProductById(id);

    return NextResponse.json(
      {
        success: true,
        data: product,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch product";
    
    if (message.includes("not found")) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    console.error("[GET /api/products/[id]]", message);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export const PUT = withApiAuth(async (req, user, context) => {
  try {
    const params = await context.params;
    const id = params?.id;
    
    if (!id) {
       return NextResponse.json({ success: false, error: "Product ID is required" }, { status: 400 });
    }

    const body = await req.json();

    // Validate request body
    const validatedData = updateProductSchema.parse(body);

    const ipAddress = req.headers.get("x-forwarded-for") || "unknown";
    const userAgent = req.headers.get("user-agent") || undefined;

    const product = await ProductService.updateProduct(
      id,
      validatedData,
      user.id,
      ipAddress,
      userAgent
    );

    return NextResponse.json(
      {
        success: true,
        message: "Product updated successfully",
        data: product,
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

    const message = error instanceof Error ? error.message : "Failed to update product";
    
    if (message.includes("not found")) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }
    
    if (message.includes("already exists")) {
      return NextResponse.json({ success: false, error: message }, { status: 409 });
    }

    console.error("[PUT /api/products/[id]]", message);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}, "MANAGE_SERVICES");

export const DELETE = withApiAuth(async (req, user, context) => {
  try {
    const params = await context.params;
    const id = params?.id;
    
    if (!id) {
       return NextResponse.json({ success: false, error: "Product ID is required" }, { status: 400 });
    }

    const ipAddress = req.headers.get("x-forwarded-for") || "unknown";
    const userAgent = req.headers.get("user-agent") || undefined;

    await ProductService.deleteProduct(id, user.id, ipAddress, userAgent);

    return NextResponse.json(
      {
        success: true,
        message: "Product deleted successfully",
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete product";
    
    if (message.includes("not found")) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    console.error("[DELETE /api/products/[id]]", message);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}, "MANAGE_SERVICES");
