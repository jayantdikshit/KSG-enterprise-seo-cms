import { NextRequest, NextResponse } from "next/server";
import { LeadService } from "@/services/LeadService";
import { updateLeadSchema } from "@/validators/contact.validator";
import { withApiAuth } from "@/middleware/apiAuth";
import { ZodError } from "zod";

export const GET = withApiAuth(async (req, user, context) => {
  try {
    const { id } = await context.params;
    const lead = await LeadService.getLeadById(id);

    return NextResponse.json(
      {
        success: true,
        data: lead,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch lead";

    if (message.includes("not found") || message.includes("Cast to ObjectId failed")) {
      return NextResponse.json({ success: false, error: "Lead not found" }, { status: 404 });
    }

    console.error("[GET /api/leads/[id]]", message);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}, "LEADS_READ");

export const PUT = withApiAuth(async (req, user, context) => {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const validatedData = updateLeadSchema.parse(body);

    const ipAddress = req.headers.get("x-forwarded-for") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    const updated = await LeadService.updateLead(id, validatedData, user.id, ipAddress, userAgent);

    return NextResponse.json(
      {
        success: true,
        message: "Lead updated successfully",
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

    const message = error instanceof Error ? error.message : "Failed to update lead";

    if (message.includes("not found") || message.includes("Cast to ObjectId failed")) {
      return NextResponse.json({ success: false, error: "Lead not found" }, { status: 404 });
    }

    console.error("[PUT /api/leads/[id]]", message);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}, "LEADS_UPDATE");

export const DELETE = withApiAuth(async (req, user, context) => {
  try {
    const { id } = await context.params;

    const ipAddress = req.headers.get("x-forwarded-for") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    const deleted = await LeadService.deleteLead(id, user.id, ipAddress, userAgent);

    return NextResponse.json(
      {
        success: true,
        message: "Lead deleted successfully",
        data: deleted,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete lead";

    if (message.includes("not found") || message.includes("Cast to ObjectId failed")) {
      return NextResponse.json({ success: false, error: "Lead not found" }, { status: 404 });
    }

    console.error("[DELETE /api/leads/[id]]", message);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}, "LEADS_DELETE");
