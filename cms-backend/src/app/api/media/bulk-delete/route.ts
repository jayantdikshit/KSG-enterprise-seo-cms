import { NextRequest, NextResponse } from "next/server";
import { MediaService } from "@/services/MediaService";
import { bulkDeleteSchema } from "@/validators/media.validator";
import { withApiAuth } from "@/middleware/apiAuth";
import { ZodError } from "zod";

export const POST = withApiAuth(async (req, user) => {
  try {
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ success: false, error: "Empty or invalid JSON body provided." }, { status: 400 });
    }
    const validatedData = bulkDeleteSchema.parse(body);

    const ipAddress = req.headers.get("x-forwarded-for") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    const deleted = await MediaService.bulkDeleteMedia(validatedData.ids, user.id, ipAddress, userAgent);

    return NextResponse.json(
      {
        success: true,
        message: `${deleted.length} media item(s) deleted successfully`,
        data: deleted,
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
    const message = error instanceof Error ? error.message : "Bulk delete failed";
    console.error("[POST /api/media/bulk-delete]", message);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}, "MEDIA_DELETE");

export const DELETE = POST;
