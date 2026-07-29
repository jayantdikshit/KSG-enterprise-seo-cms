import { NextRequest, NextResponse } from "next/server";
import { ServiceService } from "@/services/ServiceService";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const rawService = await ServiceService.getServiceBySlug(slug);
    const service: any = rawService;

    // Dynamic Google Rich Schemas
    const serviceSchema = {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": service.name,
      "description": service.shortDescription || service.description,
      "image": service.featuredImage || undefined,
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
          "name": "Services",
          "item": "/services"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": service.name,
          "item": `/services/${service.slug}`
        }
      ]
    };

    const faqSchema = service.faq && service.faq.length > 0 ? {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": service.faq.map((f: any) => ({
        "@type": "Question",
        "name": f.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": f.answer
        }
      }))
    } : null;

    let customSchema = null;
    if (service.schemaMarkup) {
      try {
        customSchema = JSON.parse(service.schemaMarkup);
      } catch (err) {
        customSchema = service.schemaMarkup;
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: service,
        schemas: {
          service: serviceSchema,
          breadcrumb: breadcrumbSchema,
          faq: faqSchema,
          custom: customSchema
        }
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch service";

    if (message.includes("not found")) {
      return NextResponse.json({ success: false, error: "Service not found" }, { status: 404 });
    }

    console.error("[GET /api/services/slug/[slug]]", message);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
export async function POST() {
  return NextResponse.json(
    { success: false, error: "Method Not Allowed" },
    { status: 405 }
  );
}
