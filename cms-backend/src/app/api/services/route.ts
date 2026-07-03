import { NextRequest, NextResponse } from "next/server";
import { ServiceService } from "@/services/ServiceService";
import { createServiceSchema } from "@/validators/service.validator";
import { withApiAuth } from "@/middleware/apiAuth";
import { ZodError } from "zod";

export const POST = withApiAuth(async (req, user) => {
  try {
    const body = await req.json();

    // Validate request body
    const validatedData = createServiceSchema.parse(body);

    const ipAddress = req.headers.get("x-forwarded-for") || "unknown";
    const userAgent = req.headers.get("user-agent") || undefined;

    const service = await ServiceService.createService(
      validatedData,
      user.id,
      ipAddress,
      userAgent
    );

    return NextResponse.json(
      {
        success: true,
        message: "Service created successfully",
        data: service,
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

    const message = error instanceof Error ? error.message : "Failed to create service";
    
    if (message.includes("already exists")) {
      return NextResponse.json({ success: false, error: message }, { status: 409 });
    }

    console.error("[POST /api/services]", message);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}, "SERVICES_CREATE");

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") || undefined;

    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { success: false, error: "Invalid pagination parameters" },
        { status: 400 }
      );
    }

    const result = await ServiceService.getAllServices(page, limit, search, status);

    return NextResponse.json(
      {
        success: true,
        data: result.data,
        pagination: result.pagination,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch services";
    console.error("[GET /api/services]", message);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
export async function PATCH() {
  return NextResponse.json(
    { success: false, error: "Method Not Allowed" },
    { status: 405 }
  );
}
