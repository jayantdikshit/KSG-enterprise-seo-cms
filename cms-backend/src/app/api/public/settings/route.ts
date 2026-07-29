import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import SeoSetting from "@/models/SeoSetting";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    let settings = await SeoSetting.findOne({}).lean();
    
    if (!settings) {
       // Return default if not set yet
       return NextResponse.json({
         success: true,
         data: {
           siteName: "KSG Energy",
           defaultTitle: "KSG Energy - Solar Solutions",
           phone: "+919876543210",
           whatsappNumber: "+919876543210",
           email: "info@ksgenergy.com",
           address: "Noida",
           socialLinks: {}
         }
       }, { status: 200 });
    }

    return NextResponse.json(
      {
        success: true,
        data: settings,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch settings";
    console.error("[GET /api/public/settings]", message);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
