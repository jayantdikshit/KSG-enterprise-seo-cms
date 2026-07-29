import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Service from "@/models/Service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    await connectDB();

    const query: any = {
      status: "PUBLISHED",
      isActive: true,
    };

    const skip = (page - 1) * limit;

    const [services, total] = await Promise.all([
      Service.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Service.countDocuments(query),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: services,
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
    const message = error instanceof Error ? error.message : "Failed to fetch public services";
    console.error("[GET /api/public/services]", message);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
