import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Blog from "@/models/Blog";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const slug = (await params).slug;
    await connectDB();

    const blog = await Blog.findOne({
      slug,
      status: "PUBLISHED",
      isActive: true,
    })
      .populate("category", "name slug")
      .lean();

    if (!blog) {
      return NextResponse.json(
        { success: false, error: "Blog not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: blog },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("[GET /api/public/blogs/[slug]]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
