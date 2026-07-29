import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import HomePage from "@/models/HomePage";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Assuming there's only one homepage record that is published
    const homepage = await HomePage.findOne({
      status: "PUBLISHED",
      isActive: true,
    }).lean();

    if (!homepage) {
      return NextResponse.json(
        { success: false, error: "Homepage not found or not published" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: homepage },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("[GET /api/public/homepage]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
