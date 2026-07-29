import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import About from "@/models/About";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Assuming there's only one about page record
    const about = await About.findOne().lean();

    if (!about) {
      return NextResponse.json(
        { success: false, error: "About page not found or not published" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: about },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("[GET /api/public/about]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
