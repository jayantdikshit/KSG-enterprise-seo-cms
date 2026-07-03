import { NextRequest, NextResponse } from "next/server";
import { MediaService } from "@/services/MediaService";
import { withApiAuth } from "@/middleware/apiAuth";

export const GET = withApiAuth(async (req, user) => {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const type = searchParams.get("type") || undefined;
    const folder = searchParams.get("folder") || undefined;
    const search = searchParams.get("search") || undefined;

    const result = await MediaService.getAllMedia(page, limit, type, folder, search);

    return NextResponse.json(
      {
        success: true,
        data: result.data,
        pagination: result.pagination,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch media";
    console.error("[GET /api/media]", message);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}, "MEDIA_READ");

export async function POST() {
  return NextResponse.json({ success: false, error: "Method Not Allowed. Use /api/media/upload or /api/media/upload-pdf" }, { status: 405 });
}
export async function PUT() {
  return NextResponse.json({ success: false, error: "Method Not Allowed" }, { status: 405 });
}
export async function DELETE() {
  return NextResponse.json({ success: false, error: "Method Not Allowed" }, { status: 405 });
}
