import { NextRequest, NextResponse } from "next/server";
import { MediaService } from "@/services/MediaService";
import { updateMediaSchema } from "@/validators/media.validator";
import { withApiAuth } from "@/middleware/apiAuth";
import { ZodError } from "zod";

export const GET = withApiAuth(async (req, user, context) => {
  try {
    const { id } = await context.params;
    const media = await MediaService.getMediaById(id);
    return NextResponse.json({ success: true, data: media }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch media";
    if (message.includes("not found") || message.includes("Cast to ObjectId failed")) {
      return NextResponse.json({ success: false, error: "Media not found" }, { status: 404 });
    }
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}, "MEDIA_READ");

export const PUT = withApiAuth(async (req, user, context) => {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const validatedData = updateMediaSchema.parse(body);

    const ipAddress = req.headers.get("x-forwarded-for") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    const updated = await MediaService.updateMediaMetadata(
      id,
      validatedData,
      user.id,
      ipAddress,
      userAgent
    );
    return NextResponse.json(
      {
        success: true,
        message: "Media metadata updated successfully",
        data: updated,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    const message = error instanceof Error ? error.message : "Failed to update media";
    if (message.includes("not found") || message.includes("Cast to ObjectId failed")) {
      return NextResponse.json({ success: false, error: "Media not found" }, { status: 404 });
    }
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}, "MEDIA_UPDATE");

export const DELETE = withApiAuth(async (req, user, context) => {
  try {
    const { id } = await context.params;
    const ipAddress = req.headers.get("x-forwarded-for") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    const deleted = await MediaService.deleteMedia(id, user.id, ipAddress, userAgent);
    return NextResponse.json(
      {
        success: true,
        message: "Media deleted successfully",
        data: deleted,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete media";
    if (message.includes("not found") || message.includes("Cast to ObjectId failed")) {
      return NextResponse.json({ success: false, error: "Media not found" }, { status: 404 });
    }
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}, "MEDIA_DELETE");
