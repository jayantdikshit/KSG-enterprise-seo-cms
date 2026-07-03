import { NextRequest, NextResponse } from "next/server";
import { AboutService } from "@/services/AboutService";
import { teamMemberSchema } from "@/validators/about.validator";
import { withApiAuth } from "@/middleware/apiAuth";
import { ZodError } from "zod";

export const PUT = withApiAuth(async (req, user, context) => {
  try {
    const { id } = await context.params;
    const body = await req.json();

    let updated;
    if (id === "new") {
      const validatedData = teamMemberSchema.parse(body);
      const ipAddress = req.headers.get("x-forwarded-for") || "unknown";
      const userAgent = req.headers.get("user-agent") || undefined;
      updated = await AboutService.addTeamMember(
        validatedData,
        user.id,
        ipAddress,
        userAgent
      );
    } else {
      const validatedData = teamMemberSchema.partial().parse(body);
      const ipAddress = req.headers.get("x-forwarded-for") || "unknown";
      const userAgent = req.headers.get("user-agent") || undefined;
      updated = await AboutService.updateTeamMember(
        id,
        validatedData,
        user.id,
        ipAddress,
        userAgent
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: id === "new" ? "Team member added successfully" : "Team member updated successfully",
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

    const message = error instanceof Error ? error.message : "Failed to process team member";

    if (message.includes("not found")) {
      return NextResponse.json({ success: false, error: message }, { status: 404 });
    }

    console.error("[PUT /api/about/team/[id]]", message);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}, "PAGES_UPDATE");

export const DELETE = withApiAuth(async (req, user, context) => {
  try {
    const { id } = await context.params;

    const ipAddress = req.headers.get("x-forwarded-for") || "unknown";
    const userAgent = req.headers.get("user-agent") || undefined;

    const updated = await AboutService.deleteTeamMember(
      id,
      user.id,
      ipAddress,
      userAgent
    );

    return NextResponse.json(
      {
        success: true,
        message: "Team member deleted successfully",
        data: updated,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete team member";

    if (message.includes("not found")) {
      return NextResponse.json({ success: false, error: message }, { status: 404 });
    }

    console.error("[DELETE /api/about/team/[id]]", message);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}, "PAGES_UPDATE"); // Admin only Pages Update scope
