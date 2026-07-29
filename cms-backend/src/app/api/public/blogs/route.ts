import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Blog from "@/models/Blog";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const category = searchParams.get("category") || undefined;

    await connectDB();

    const query: any = {
      status: "PUBLISHED",
      isActive: true,
    };

    if (category) {
      query.category = category;
    }

    const skip = (page - 1) * limit;

    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("category", "name slug")
        .lean(),
      Blog.countDocuments(query),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: blogs,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch public blogs";
    console.error("[GET /api/public/blogs]", message);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
