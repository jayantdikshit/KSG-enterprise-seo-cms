import React from "react";
import { notFound } from "next/navigation";
export const dynamic = 'force-dynamic';
import { connectDB } from "@/lib/mongodb";
import Service from "@/models/Service";
import WhyChooseUsSection from '@/components/public/WhyChooseUsSection';
import TestimonialsSection from '@/components/public/TestimonialsSection';
import FAQSection from '@/components/public/FAQSection';
import ContactCTASection from '@/components/public/ContactCTASection';

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  await connectDB();
  const service = await Service.findOne({ slug: params.slug }).lean() as any;

  if (!service) {
    return { title: "Service Not Found" };
  }

  return {
    title: service.seoTitle || `${service.name} - KSG Energy`,
    description: service.metaDescription || service.shortDescription,
    keywords: service.metaKeywords?.join(", "),
    alternates: {
      canonical: service.canonicalUrl || `https://yoursite.com/services/${service.slug}`,
    },
    openGraph: {
      title: service.ogTitle || service.seoTitle || service.name,
      description: service.ogDescription || service.metaDescription || service.shortDescription,
      images: service.ogImage ? [{ url: service.ogImage }] : [],
    },
  };
}

export default async function SingleServicePage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  await connectDB();
  const serviceDoc = await Service.findOne({ slug: params.slug, status: 'PUBLISHED' }).lean();

  if (!serviceDoc) {
    notFound();
  }

  const service = JSON.parse(JSON.stringify(serviceDoc));

  // Generate FAQ Schema if enabled and FAQs exist
  const faqSchema = service.generateFaqSchema && service.faq && service.faq.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": service.faq.map((q: any) => ({
      "@type": "Question",
      "name": q.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": q.answer
      }
    }))
  } : null;

  // Generate Breadcrumb Schema if enabled
  const breadcrumbSchema = service.generateBreadcrumbSchema ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://yoursite.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Services",
        "item": "https://yoursite.com/services"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": service.name,
        "item": `https://yoursite.com/services/${service.slug}`
      }
    ]
  } : null;

  return (
    <section className="solar-page">
      {/* Inject SEO Schemas */}
      {service.schemaMarkup && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: service.schemaMarkup }} />
      )}
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}
      {breadcrumbSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      )}

      {/* Hero */}
      <div 
        className="solar-hero" 
        style={{
          backgroundImage: service.bannerImage ? `linear-gradient(rgba(10,25,47,0.8), rgba(10,25,47,0.9)), url(${service.bannerImage})` : undefined
        }}
      >
        <div className="container">
          <span className="solar-tag">{service.name}</span>
          <h1>
            {service.name.split(' ').map((word: string, i: number, arr: any[]) => 
              i === arr.length - 1 ? <span key={i}> {word}</span> : word + " "
            )}
          </h1>
          <p>{service.shortDescription}</p>
        </div>
      </div>

      {/* Intro */}
      <div className="container" style={{ marginTop: '80px', marginBottom: '80px' }}>
        <div className="solar-intro">
          <div className="solar-image">
            <img
              src={service.featuredImage || "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1400"}
              alt={service.name}
            />
          </div>
          <div className="solar-content" style={{ minWidth: 0 }}>
            <h2>Overview</h2>
            <style>{`
              .rich-text-content * {
                white-space: pre-wrap !important;
                word-wrap: break-word !important;
                overflow-wrap: break-word !important;
              }
            `}</style>
            <div className="rich-text-content" dangerouslySetInnerHTML={{ __html: service.description }} />
            {service.keyFeatures && service.keyFeatures.length > 0 && (
              <ul style={{ marginTop: '20px' }}>
                {service.keyFeatures.map((feature: string, i: number) => (
                  <li key={i}>✔ {feature}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Benefits */}
      {service.benefits && service.benefits.length > 0 && (
        <div className="solar-benefits">
          <div className="container">
            <h2>Benefits of {service.name}</h2>
            <div className="benefits-grid">
              {service.benefits.map((benefit: string, index: number) => (
                <div className="benefit-box" key={index}>
                  <p style={{ marginTop: '15px' }}>{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FAQ */}
      {service.faq && service.faq.length > 0 && (
        <div className="container" style={{ marginTop: '80px', marginBottom: '80px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '40px', fontSize: '2.5rem', color: '#ffffff' }}>
            Frequently Asked Questions
          </h2>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {service.faq.map((q: any, i: number) => (
              <details key={i} style={{ marginBottom: '15px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <summary style={{ padding: '20px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', color: '#0f172a' }}>
                  {q.question}
                </summary>
                <div style={{ padding: '0 20px 20px', color: '#475569', lineHeight: '1.6' }}>
                  {q.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      )}

      
      {/* Why Choose Us */}
      {service.whyChooseUs && service.whyChooseUs.cards && service.whyChooseUs.cards.length > 0 && (
        <WhyChooseUsSection data={service.whyChooseUs} />
      )}

      {/* Testimonials */}
      {service.testimonials && service.testimonials.length > 0 && (
        <TestimonialsSection testimonials={service.testimonials} />
      )}

      {/* Structured CTA (New) */}
      {service.contactCTA && service.contactCTA.heading && (
        <ContactCTASection data={service.contactCTA} />
      )}

      {/* CTA */}
      <div className="solar-cta">
        <div className="container">
          <h2>{service.ctaTitle || "Ready to optimize your energy consumption?"}</h2>
          <a href="/contact">
            <button>{service.ctaButtonText || "Contact Us Today"}</button>
          </a>
        </div>
      </div>
    </section>
  );
}
