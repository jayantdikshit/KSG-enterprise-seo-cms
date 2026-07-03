import { NextRequest, NextResponse } from "next/server";
import { MediaService } from "@/services/MediaService";
import { renameFolderSchema } from "@/validators/media.validator";
import { withApiAuth } from "@/middleware/apiAuth";
import { ZodError } from "zod";

export const PUT = withApiAuth(async (req, user, context) => {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const validatedData = renameFolderSchema.parse(body);

    const ipAddress = req.headers.get("x-forwarded-for") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    const folder = await MediaService.renameFolder(
      id,
      validatedData.name,
      user.id,
      ipAddress,
      userAgent
    );

    return NextResponse.json(
      {
        success: true,
        message: "Folder renamed successfully",
        data: folder,
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
    const message = error instanceof Error ? error.message : "Failed to rename folder";
    if (message.includes("not found")) {
      return NextResponse.json({ success: false, error: "Folder not found" }, { status: 404 });
    }
    if (message.includes("already exists")) {
      return NextResponse.json({ success: false, error: message }, { status: 409 });
    }
    console.error("[PUT /api/media/folders/[id]]", message);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}, "MEDIA_UPDATE");

export const DELETE = withApiAuth(async (req, user, context) => {
  try {
    const { id } = await context.params;

    const ipAddress = req.headers.get("x-forwarded-for") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    const folder = await MediaService.deleteFolder(id, user.id, ipAddress, userAgent);

    return NextResponse.json(
      {
        success: true,
        message: "Folder deleted successfully",
        data: folder,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete folder";
    if (message.includes("not found")) {
      return NextResponse.json({ success: false, error: "Folder not found" }, { status: 404 });
    }
    if (message.includes("not empty")) {
      return NextResponse.json({ success: false, error: message }, { status: 400 });
    }
    console.error("[DELETE /api/media/folders/[id]]", message);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}, "MEDIA_DELETE");
