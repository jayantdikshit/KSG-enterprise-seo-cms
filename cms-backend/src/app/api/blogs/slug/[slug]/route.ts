import { NextRequest, NextResponse } from "next/server";
import { BlogService } from "@/services/BlogService";
import { verifyAccessToken } from "@/utils/jwt";
import User from "@/models/User";
import { connectDB } from "@/lib/mongodb";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

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
            const userDoc = await User.findById(decoded.id).populate("role");
            if (userDoc && userDoc.isActive) {
              const permissions: string[] = userDoc.role?.permissions || [];
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

    const { blog, relatedBlogs } = await BlogService.getBlogBySlug(slug, previewMode);

    // Google Rich result schemas compilation
    const articleSchema = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": blog.title,
      "image": blog.featuredImage || undefined,
      "datePublished": blog.publishDate,
      "dateModified": blog.updatedAt,
      "author": {
        "@type": "Person",
        "name": blog.authorName || (blog.author?.name || "Admin")
      },
      "publisher": {
        "@type": "Organization",
        "name": "CMS Agency",
        "logo": {
          "@type": "ImageObject",
          "url": "https://example.com/logo.png"
        }
      },
      "description": blog.metaDescription || blog.title
    };

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Blog",
          "item": "/blog"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": blog.category?.name || "Category",
          "item": `/blog/category/${blog.category?.slug || ""}`
        },
        {
          "@type": "ListItem",
          "position": 4,
          "name": blog.title,
          "item": `/blog/${blog.slug}`
        }
      ]
    };

    let customSchema = null;
    if (blog.schemaMarkup) {
      try {
        customSchema = JSON.parse(blog.schemaMarkup);
      } catch (err) {
        customSchema = blog.schemaMarkup;
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: blog,
        relatedBlogs,
        schemas: {
          article: articleSchema,
          breadcrumb: breadcrumbSchema,
          custom: customSchema
        }
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch blog";

    if (message.includes("not found")) {
      return NextResponse.json({ success: false, error: "Blog not found" }, { status: 404 });
    }

    console.error("[GET /api/blogs/slug/[slug]]", message);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json({ success: false, error: "Method Not Allowed" }, { status: 405 });
}
