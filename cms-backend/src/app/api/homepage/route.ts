import { NextRequest, NextResponse } from "next/server";
import { HomePageService } from "@/services/HomePageService";
import { createHomePageSchema, updateHomePageSchema } from "@/validators/homepage.validator";
import { withApiAuth } from "@/middleware/apiAuth";
import { verifyAccessToken } from "@/utils/jwt";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { ZodError } from "zod";

// Force Next.js recompilation for robust validation checks
export const POST = withApiAuth(async (req, user) => {
  try {
    const body = await req.json();

    // Validate input schema
    const validatedData = createHomePageSchema.parse(body);

    const ipAddress = req.headers.get("x-forwarded-for") || "unknown";
    const userAgent = req.headers.get("user-agent") || undefined;

    const homepage = await HomePageService.createHomePage(
      validatedData,
      user.id,
      ipAddress,
      userAgent
    );

    return NextResponse.json(
      {
        success: true,
        message: "Homepage created successfully",
        data: homepage,
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

    const message = error instanceof Error ? error.message : "Failed to create homepage";
    
    if (message.includes("already exists") || message.includes("not exist in the database")) {
      return NextResponse.json({ success: false, error: message }, { status: 400 });
    }

    console.error("[POST /api/homepage]", message);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}, "PAGES_CREATE");

export const PUT = withApiAuth(async (req, user) => {
  try {
    const body = await req.json();

    // Validate input schema (partial allowed for updates)
    const validatedData = updateHomePageSchema.parse(body);

    const ipAddress = req.headers.get("x-forwarded-for") || "unknown";
    const userAgent = req.headers.get("user-agent") || undefined;

    const updated = await HomePageService.updateHomePage(
      validatedData,
      user.id,
      ipAddress,
      userAgent
    );

    return NextResponse.json(
      {
        success: true,
        message: "Homepage updated successfully",
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

    const message = error instanceof Error ? error.message : "Failed to update homepage";
    
    if (message.includes("not found")) {
      return NextResponse.json({ success: false, error: "Homepage not found" }, { status: 404 });
    }

    if (message.includes("not exist in the database")) {
      return NextResponse.json({ success: false, error: message }, { status: 400 });
    }

    console.error("[PUT /api/homepage]", message);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}, "PAGES_UPDATE");

export async function GET(req: NextRequest) {
  try {
    // Determine preview mode from token
    let previewMode = false;
    const authHeader = req.headers.get("authorization");
    
    if (authHeader) {
      try {
        const token = authHeader.startsWith("Bearer ")
          ? authHeader.substring(7)
          : authHeader.split(" ")[1];
          
        if (token) {
          const decoded: any = verifyAccessToken(token);
          if (decoded && decoded.id) {
            await connectDB();
            const userDoc = await User.findById(decoded.id).populate("role");
            if (userDoc && userDoc.isActive) {
              const permissions: string[] = userDoc.role?.permissions || [];
              if (permissions.includes("PAGES_READ") || permissions.includes("ALL")) {
                previewMode = true;
              }
            }
          }
        }
      } catch (err) {
        // Fallback silently to public view
      }
    }

    const homepage = await HomePageService.getHomePage(previewMode);

    return NextResponse.json(
      {
        success: true,
        data: homepage,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch homepage";
    
    if (message.includes("not found")) {
      return NextResponse.json({ success: false, error: "Homepage not found" }, { status: 404 });
    }

    console.error("[GET /api/homepage]", message);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
