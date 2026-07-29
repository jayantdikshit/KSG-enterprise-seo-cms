import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Service from "@/models/Service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const slug = (await params).slug;
    await connectDB();

    const service = await Service.findOne({
      slug,
      status: "PUBLISHED",
      isActive: true,
    }).lean();

    if (!service) {
      return NextResponse.json(
        { success: false, error: "Service not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: service },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("[GET /api/public/services/[slug]]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
