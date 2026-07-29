import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Menu from "@/models/Menu";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const menus = await Menu.find({
      isActive: true,
    })
      .sort({ name: 1 })
      .lean();

    return NextResponse.json(
      { success: true, data: menus },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("[GET /api/public/menus]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
