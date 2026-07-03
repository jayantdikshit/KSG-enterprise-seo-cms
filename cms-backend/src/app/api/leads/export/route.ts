import { NextRequest, NextResponse } from "next/server";
import { LeadService } from "@/services/LeadService";
import { withApiAuth } from "@/middleware/apiAuth";

export const GET = withApiAuth(async (req, user) => {
  try {
    const ipAddress = req.headers.get("x-forwarded-for") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    const csvContent = await LeadService.exportCSV(user.id, ipAddress, userAgent);

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="leads-export-${Date.now()}.csv"`,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to export leads";
    console.error("[GET /api/leads/export]", message);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}, "LEADS_READ");
