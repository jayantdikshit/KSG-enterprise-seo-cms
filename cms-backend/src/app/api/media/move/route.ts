import { NextRequest, NextResponse } from "next/server";
import { MediaService } from "@/services/MediaService";
import { moveFilesSchema } from "@/validators/media.validator";
import { withApiAuth } from "@/middleware/apiAuth";
import { ZodError } from "zod";

export const PATCH = withApiAuth(async (req, user) => {
  try {
    const body = await req.json();
    const validatedData = moveFilesSchema.parse(body);

    const ipAddress = req.headers.get("x-forwarded-for") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    const updatedMedia = await MediaService.moveFiles(
      validatedData.ids,
      validatedData.folder,
      user.id,
      ipAddress,
      userAgent
    );

    return NextResponse.json(
      {
        success: true,
        message: `${updatedMedia.length} media item(s) moved to folder '${validatedData.folder}' successfully`,
        data: updatedMedia,
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
    const message = error instanceof Error ? error.message : "Failed to move files";
    if (message.includes("does not exist")) {
      return NextResponse.json({ success: false, error: message }, { status: 400 });
    }
    console.error("[PATCH /api/media/move]", message);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}, "MEDIA_UPDATE");

export const POST = PATCH;
