import { NextRequest, NextResponse } from "next/server";
import { ServiceService } from "@/services/ServiceService";
import { updateServiceSchema } from "@/validators/service.validator";
import { withApiAuth } from "@/middleware/apiAuth";
import { ZodError } from "zod";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const service = await ServiceService.getServiceById(id);

    return NextResponse.json(
      {
        success: true,
        data: service,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch service";
    
    if (message.includes("not found")) {
      return NextResponse.json({ success: false, error: "Service not found" }, { status: 404 });
    }

    console.error("[GET /api/services/[id]]", message);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export const PUT = withApiAuth(async (req, user, context) => {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const validatedData = updateServiceSchema.parse(body);

    const ipAddress = req.headers.get("x-forwarded-for") || "unknown";
    const userAgent = req.headers.get("user-agent") || undefined;

    const updated = await ServiceService.updateService(
      id,
      validatedData,
      user.id,
      ipAddress,
      userAgent
    );

    return NextResponse.json(
      {
        success: true,
        message: "Service updated successfully",
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

    const message = error instanceof Error ? error.message : "Failed to update service";
    
    if (message.includes("not found")) {
      return NextResponse.json({ success: false, error: "Service not found" }, { status: 404 });
    }
    
    if (message.includes("already exists")) {
      return NextResponse.json({ success: false, error: message }, { status: 409 });
    }

    console.error("[PUT /api/services/[id]]", message);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}, "SERVICES_UPDATE");

export const DELETE = withApiAuth(async (req, user, context) => {
  try {
    const { id } = await context.params;

    const ipAddress = req.headers.get("x-forwarded-for") || "unknown";
    const userAgent = req.headers.get("user-agent") || undefined;

    const deleted = await ServiceService.deleteService(
      id,
      user.id,
      ipAddress,
      userAgent
    );

    return NextResponse.json(
      {
        success: true,
        message: "Service deleted successfully",
        data: deleted,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete service";

    if (message.includes("not found")) {
      return NextResponse.json({ success: false, error: "Service not found" }, { status: 404 });
    }

    console.error("[DELETE /api/services/[id]]", message);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}, "SERVICES_DELETE");
