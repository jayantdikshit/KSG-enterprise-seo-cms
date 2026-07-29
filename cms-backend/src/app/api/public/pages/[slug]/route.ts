import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Page from "@/models/Page";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const slug = (await params).slug;
    await connectDB();

    const page = await Page.findOne({
      slug,
      status: "PUBLISHED",
      isActive: true,
    }).lean();

    if (!page) {
      return NextResponse.json(
        { success: false, error: "Page not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: page },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("[GET /api/public/pages/[slug]]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
