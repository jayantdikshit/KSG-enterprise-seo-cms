import { NextRequest, NextResponse } from "next/server";
import { LeadService } from "@/services/LeadService";
import { createContactSchema } from "@/validators/contact.validator";
import { ZodError } from "zod";

async function verifyRecaptcha(token: string) {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  if (!secretKey) {
    // If no secret key is configured, bypass verification for development/testing
    return true;
  }
  try {
    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${secretKey}&response=${token}`,
    });
    const result = await response.json();
    return !!result.success;
  } catch (error) {
    console.error("reCAPTCHA validation error:", error);
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = createContactSchema.parse(body);

    if (validatedData.captchaToken) {
      const isValidCaptcha = await verifyRecaptcha(validatedData.captchaToken);
      if (!isValidCaptcha) {
        return NextResponse.json(
          { success: false, error: "reCAPTCHA verification failed" },
          { status: 400 }
        );
      }
    }

    const ipAddress = req.headers.get("x-forwarded-for") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    const lead = await LeadService.createLead(validatedData, ipAddress, userAgent);

    return NextResponse.json(
      {
        success: true,
        message: "Contact form submitted successfully",
        data: lead,
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

    const message = error instanceof Error ? error.message : "Failed to submit contact form";
    console.error("[POST /api/contact]", message);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
