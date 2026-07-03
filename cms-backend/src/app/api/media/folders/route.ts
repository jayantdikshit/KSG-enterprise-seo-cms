import { NextRequest, NextResponse } from "next/server";
import { MediaService } from "@/services/MediaService";
import { createFolderSchema } from "@/validators/media.validator";
import { withApiAuth } from "@/middleware/apiAuth";
import { ZodError } from "zod";

export const POST = withApiAuth(async (req, user) => {
  try {
    const body = await req.json();
    const validatedData = createFolderSchema.parse(body);

    const ipAddress = req.headers.get("x-forwarded-for") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    const folder = await MediaService.createFolder(validatedData.name, user.id, ipAddress, userAgent);

    return NextResponse.json(
      {
        success: true,
        message: "Folder created successfully",
        data: folder,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    const message = error instanceof Error ? error.message : "Failed to create folder";
    if (message.includes("already exists")) {
      return NextResponse.json({ success: false, error: message }, { status: 409 });
    }
    console.error("[POST /api/media/folders]", message);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}, "MEDIA_CREATE");

export const GET = withApiAuth(async (req, user) => {
  try {
    const folders = await MediaService.listFolders();
    return NextResponse.json(
      {
        success: true,
        data: folders,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to list folders";
    console.error("[GET /api/media/folders]", message);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}, "MEDIA_READ");
