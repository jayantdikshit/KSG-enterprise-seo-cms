import { NextRequest, NextResponse } from "next/server";
import { MediaService } from "@/services/MediaService";
import { withApiAuth } from "@/middleware/apiAuth";
import path from "path";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export const POST = withApiAuth(async (req, user) => {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    const ext = path.extname(file.name).toLowerCase();
    if (ext !== ".pdf") {
      return NextResponse.json(
        { success: false, error: "Invalid file format. Only PDF files are allowed." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: "File size exceeds limit of 10 MB" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const folder = formData.get("folder") as string || "uncategorized";
    const alt = formData.get("alt") as string || "";
    const title = formData.get("title") as string || "";
    const caption = formData.get("caption") as string || "";
    const description = formData.get("description") as string || "";

    const ipAddress = req.headers.get("x-forwarded-for") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    const media = await MediaService.uploadPDF(
      {
        fileName: file.name,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        folder,
        alt,
        title,
        caption,
        description,
      },
      buffer,
      user.id,
      ipAddress,
      userAgent
    );

    return NextResponse.json(
      {
        success: true,
        message: "PDF uploaded successfully",
        data: media,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to upload PDF";
    console.error("[POST /api/media/upload-pdf]", message);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}, "MEDIA_CREATE");
export async function GET() {
  return NextResponse.json({ success: false, error: "Method Not Allowed" }, { status: 405 });
}
export async function PUT() {
  return NextResponse.json({ success: false, error: "Method Not Allowed" }, { status: 405 });
}
export async function DELETE() {
  return NextResponse.json({ success: false, error: "Method Not Allowed" }, { status: 405 });
}
