import { NextRequest, NextResponse } from "next/server";
import { AboutService } from "@/services/AboutService";
import { createAboutSchema, updateAboutSchema } from "@/validators/about.validator";
import { withApiAuth } from "@/middleware/apiAuth";
import { ZodError } from "zod";

// Force Next.js recompilation for About page schema updates
export const POST = withApiAuth(async (req, user) => {
  try {
    const body = await req.json();

    // Validate inputs
    const validatedData = createAboutSchema.parse(body);

    const ipAddress = req.headers.get("x-forwarded-for") || "unknown";
    const userAgent = req.headers.get("user-agent") || undefined;

    const about = await AboutService.createAbout(
      validatedData,
      user.id,
      ipAddress,
      userAgent
    );

    return NextResponse.json(
      {
        success: true,
        message: "About Us page created successfully",
        data: about,
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

    const message = error instanceof Error ? error.message : "Failed to create About Us config";

    if (message.includes("already exists")) {
      return NextResponse.json({ success: false, error: message }, { status: 400 });
    }

    console.error("[POST /api/about]", message);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}, "PAGES_CREATE");

export const PUT = withApiAuth(async (req, user) => {
  try {
    const body = await req.json();

    // Validate inputs
    const validatedData = updateAboutSchema.parse(body);

    const ipAddress = req.headers.get("x-forwarded-for") || "unknown";
    const userAgent = req.headers.get("user-agent") || undefined;

    const updated = await AboutService.updateAbout(
      validatedData,
      user.id,
      ipAddress,
      userAgent
    );

    return NextResponse.json(
      {
        success: true,
        message: "About Us page updated successfully",
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

    const message = error instanceof Error ? error.message : "Failed to update About Us config";

    if (message.includes("not found")) {
      return NextResponse.json({ success: false, error: "About page not found" }, { status: 404 });
    }

    console.error("[PUT /api/about]", message);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}, "PAGES_UPDATE");

export async function GET(req: NextRequest) {
  try {
    const about = await AboutService.getAbout();

    return NextResponse.json(
      {
        success: true,
        data: about,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch About Us config";

    if (message.includes("not found")) {
      return NextResponse.json({ success: false, error: "About page not found" }, { status: 404 });
    }

    console.error("[GET /api/about]", message);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
