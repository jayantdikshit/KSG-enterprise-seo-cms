import { NextRequest, NextResponse } from "next/server";
import { BlogService } from "@/services/BlogService";
import { updateBlogSchema } from "@/validators/blog.validator";
import { withApiAuth } from "@/middleware/apiAuth";
import { verifyAccessToken } from "@/utils/jwt";
import User from "@/models/User";
import { ZodError } from "zod";
import { connectDB } from "@/lib/mongodb";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if requester has admin/editor view permissions
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
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
if (userDoc && (userDoc as any).isActive) {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
const permissions: string[] = (userDoc as any).role?.permissions || [];
              if (permissions.includes("BLOGS_READ") || permissions.includes("ALL")) {
                previewMode = true;
              }
            }
          }
        }
      } catch (err) {
        // Fallback silently
      }
    }

    const blog = await BlogService.getBlogById(id, previewMode);

    return NextResponse.json(
      {
        success: true,
        data: blog,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch blog";
    
    if (message.includes("not found")) {
      return NextResponse.json({ success: false, error: "Blog not found" }, { status: 404 });
    }

    console.error("[GET /api/blogs/[id]]", message);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export const PUT = withApiAuth(async (req, user, context) => {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const validatedData = updateBlogSchema.parse(body);

    const ipAddress = req.headers.get("x-forwarded-for") || "unknown";
    const userAgent = req.headers.get("user-agent") || undefined;

    const updated = await BlogService.updateBlog(
      id,
      validatedData,
      user.id,
      ipAddress,
      userAgent
    );

    return NextResponse.json(
      {
        success: true,
        message: "Blog updated successfully",
        data: updated,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    const message = error instanceof Error ? error.message : "Failed to update blog";
    
    if (message.includes("not found")) {
      return NextResponse.json({ success: false, error: "Blog not found" }, { status: 404 });
    }
    
    if (message.includes("already exists")) {
      return NextResponse.json({ success: false, error: message }, { status: 409 });
    }
    if (message.includes("Category not found")) {
      return NextResponse.json({ success: false, error: message }, { status: 400 });
    }

    console.error("[PUT /api/blogs/[id]]", message);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}, "BLOGS_UPDATE");

export const DELETE = withApiAuth(async (req, user, context) => {
  try {
    const { id } = await context.params;

    const ipAddress = req.headers.get("x-forwarded-for") || "unknown";
    const userAgent = req.headers.get("user-agent") || undefined;

    const deleted = await BlogService.deleteBlog(
      id,
      user.id,
      ipAddress,
      userAgent
    );

    return NextResponse.json(
      {
        success: true,
        message: "Blog deleted successfully",
        data: deleted,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete blog";

    if (message.includes("not found")) {
      return NextResponse.json({ success: false, error: "Blog not found" }, { status: 404 });
    }

    console.error("[DELETE /api/blogs/[id]]", message);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}, "BLOGS_DELETE");
