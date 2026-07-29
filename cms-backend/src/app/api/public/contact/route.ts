import { NextRequest, NextResponse } from "next/server";
import { LeadService } from "@/services/LeadService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // IP and User Agent for audit log
    const ipAddress = req.headers.get("x-forwarded-for") || (req as any).ip || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    // Validate required fields
    if (!body.name || !body.email || !body.message) {
      return NextResponse.json({ error: "Name, email, and message are required" }, { status: 400 });
    }

    const lead = await LeadService.createLead(
      {
        name: body.name,
        email: body.email,
        phone: body.phone || "",
        companyName: body.company || "",
        message: body.message,
      },
      ipAddress,
      userAgent
    );

    return NextResponse.json({ success: true, data: lead });
  } catch (error: any) {
    console.error("Public Contact API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit contact request" },
      { status: 500 }
    );
  }
}
