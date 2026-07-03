import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

export async function GET() {
  try {
    await connectDB();

    return NextResponse.json({
      success: true,
      database: "connected",
      message: "CMS Backend Running",
    });
  } catch (error: unknown) {
    console.error("Health route DB error:", error);

    return NextResponse.json(
      {
        success: false,
        database: "disconnected",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}