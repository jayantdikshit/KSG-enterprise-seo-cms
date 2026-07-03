import { NextRequest, NextResponse } from "next/server";
import { AboutService } from "@/services/AboutService";
import { statisticSchema } from "@/validators/about.validator";
import { withApiAuth } from "@/middleware/apiAuth";
import { ZodError } from "zod";

export const PUT = withApiAuth(async (req, user, context) => {
  try {
    const { id } = await context.params;
    const body = await req.json();

    let updated;
    if (id === "new") {
      const validatedData = statisticSchema.parse(body);
      const ipAddress = req.headers.get("x-forwarded-for") || "unknown";
      const userAgent = req.headers.get("user-agent") || undefined;
      updated = await AboutService.addStatistic(
        validatedData,
        user.id,
        ipAddress,
        userAgent
      );
    } else {
      const validatedData = statisticSchema.partial().parse(body);
      const ipAddress = req.headers.get("x-forwarded-for") || "unknown";
      const userAgent = req.headers.get("user-agent") || undefined;
      updated = await AboutService.updateStatistic(
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
        message: id === "new" ? "Statistic added successfully" : "Statistic updated successfully",
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

    const message = error instanceof Error ? error.message : "Failed to process statistic";

    if (message.includes("not found")) {
      return NextResponse.json({ success: false, error: message }, { status: 404 });
    }

    console.error("[PUT /api/about/statistics/[id]]", message);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}, "PAGES_UPDATE");

export const DELETE = withApiAuth(async (req, user, context) => {
  try {
    const { id } = await context.params;

    const ipAddress = req.headers.get("x-forwarded-for") || "unknown";
    const userAgent = req.headers.get("user-agent") || undefined;

    const updated = await AboutService.deleteStatistic(
      id,
      user.id,
      ipAddress,
      userAgent
    );

    return NextResponse.json(
      {
        success: true,
        message: "Statistic deleted successfully",
        data: updated,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete statistic";

    if (message.includes("not found")) {
      return NextResponse.json({ success: false, error: message }, { status: 404 });
    }

    console.error("[DELETE /api/about/statistics/[id]]", message);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}, "PAGES_UPDATE");
