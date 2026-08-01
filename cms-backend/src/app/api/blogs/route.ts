import { NextRequest, NextResponse } from "next/server";
import { BlogService } from "@/services/BlogService";
import { createBlogSchema } from "@/validators/blog.validator";
import { withApiAuth } from "@/middleware/apiAuth";
import { verifyAccessToken } from "@/utils/jwt";
import User from "@/models/User";
import { ZodError } from "zod";
import { connectDB } from "@/lib/mongodb";

export const POST = withApiAuth(async (req, user) => {
  try {
    const body = await req.json();

    // Validate request body
    const validatedData = createBlogSchema.parse(body);

    const ipAddress = req.headers.get("x-forwarded-for") || "unknown";
    const userAgent = req.headers.get("user-agent") || undefined;

    const blog = await BlogService.createBlog(
      validatedData,
      user.id,
      ipAddress,
      userAgent
    );

    return NextResponse.json(
      {
        success: true,
        message: "Blog created successfully",
        data: blog,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      console.error("[POST /api/blogs] Validation Error Details:", JSON.stringify(error.issues, null, 2));
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    const message = error instanceof Error ? error.message : "Failed to create blog";
    
    if (message.includes("already exists")) {
      return NextResponse.json({ success: false, error: message }, { status: 409 });
    }
    if (message.includes("Category not found")) {
      return NextResponse.json({ success: false, error: message }, { status: 400 });
    }

    console.error("[POST /api/blogs]", message);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}, "BLOGS_CREATE");

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") || undefined;
    const category = searchParams.get("category") || undefined;
    const tag = searchParams.get("tag") || undefined;
    const sort = searchParams.get("sort") || undefined;

    if (page < 1 || limit < 1 || limit > 1000) {
      return NextResponse.json(
        { success: false, error: "Invalid pagination parameters" },
        { status: 400 }
      );
    }

    // Determine preview mode (admin/editor viewing drafts/scheduled)
    let previewMode = false;
    const authHeader = req.headers.get("authorization");
    if (authHeader) {
      try {
        const token = authHeader.startsWith("Bearer ")
          ? authHeader.substring(7)
          : authHeader.split(" ")[1];
        if (token) {
          const decoded: any = verifyAccessToken(token);
          if (decoded && decoded.id) {
            await connectDB();
            const userDoc: any = await User.findById(decoded.id).populate("role");
            if (userDoc && userDoc.isActive) {
              const permissions: string[] = userDoc.role?.permissions || [];
              if (permissions.includes("BLOGS_READ") || permissions.includes("ALL")) {
                previewMode = true;
              }
            }
          }
        }
      } catch (err) {
        // Fallback silently to public (previewMode = false)
      }
    }

    const result = await BlogService.getAllBlogs({
      page,
      limit,
      search,
      status,
      category,
      tag,
      sort,
      previewMode,
    });

    return NextResponse.json(
      {
        success: true,
        data: result.data,
        pagination: result.pagination,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch blogs";
    console.error("[GET /api/blogs]", message);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
