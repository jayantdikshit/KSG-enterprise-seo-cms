import { NextRequest, NextResponse } from "next/server";
import { MenuService } from "@/services/MenuService";

export async function GET(req: NextRequest) {
  try {
    const menu = await MenuService.getMenuByLocation("header");

    return NextResponse.json(
      {
        success: true,
        data: menu,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch header menu";

    if (message.includes("not found")) {
      return NextResponse.json({ success: false, error: message }, { status: 404 });
    }

    console.error("[GET /api/menus/location/header]", message);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
export async function POST() {
  return NextResponse.json({ success: false, error: "Method Not Allowed" }, { status: 405 });
}
