import { NextRequest, NextResponse } from "next/server";
import { LeadService } from "@/services/LeadService";
import { withApiAuth } from "@/middleware/apiAuth";

export const PATCH = withApiAuth(async (req, user, context) => {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { status } = body;

    if (!status || !["NEW", "CONTACTED", "QUALIFIED", "CLOSED"].includes(status.toUpperCase())) {
      return NextResponse.json(
        { success: false, error: "Invalid status. Must be NEW, CONTACTED, QUALIFIED, or CLOSED." },
        { status: 400 }
      );
    }

    const ipAddress = req.headers.get("x-forwarded-for") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    const updated = await LeadService.updateLeadStatus(
      id,
      status.toUpperCase(),
      user.id,
      ipAddress,
      userAgent
    );

    return NextResponse.json(
      {
        success: true,
        message: "Lead status updated successfully",
        data: updated,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update lead status";

    if (message.includes("not found") || message.includes("Cast to ObjectId failed")) {
      return NextResponse.json({ success: false, error: "Lead not found" }, { status: 404 });
    }

    console.error("[PATCH /api/leads/[id]/status]", message);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}, "LEADS_UPDATE");
