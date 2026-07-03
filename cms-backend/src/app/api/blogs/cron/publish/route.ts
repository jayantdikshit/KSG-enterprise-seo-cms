import { NextRequest, NextResponse } from "next/server";
import { BlogService } from "@/services/BlogService";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const secret = searchParams.get("secret");

    const expectedSecret = process.env.CRON_SECRET || "local-cron-key";
    if (secret !== expectedSecret) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Invalid cron secret key" },
        { status: 401 }
      );
    }

    const ipAddress = req.headers.get("x-forwarded-for") || "unknown";
    const userAgent = req.headers.get("user-agent") || undefined;

    const publishedIds = await BlogService.publishScheduledBlogs(ipAddress, userAgent);

    return NextResponse.json(
      {
        success: true,
        message: `Successfully processed background scheduled publishing.`,
        processedCount: publishedIds.length,
        publishedBlogIds: publishedIds,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to execute cron scheduler";
    console.error("[GET /api/blogs/cron/publish]", message);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json({ success: false, error: "Method Not Allowed" }, { status: 405 });
}
