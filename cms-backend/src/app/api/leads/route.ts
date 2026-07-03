import { NextRequest, NextResponse } from "next/server";
import { LeadService } from "@/services/LeadService";
import { withApiAuth } from "@/middleware/apiAuth";

export const GET = withApiAuth(async (req, user) => {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") || undefined;

    const leads = await LeadService.getLeads(page, limit, search, status);

    return NextResponse.json(
      {
        success: true,
        data: leads.data,
        pagination: leads.pagination,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch leads";
    console.error("[GET /api/leads]", message);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}, "LEADS_READ");
