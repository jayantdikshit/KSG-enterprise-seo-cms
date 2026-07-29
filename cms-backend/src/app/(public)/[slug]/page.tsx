import React from "react";
import { notFound } from "next/navigation";
export const dynamic = 'force-dynamic';
import { connectDB } from "@/lib/mongodb";
import Page from "@/models/Page";
import WhyChooseUsSection from '@/components/public/WhyChooseUsSection';
import TestimonialsSection from '@/components/public/TestimonialsSection';
import FAQSection from '@/components/public/FAQSection';
import ContactCTASection from '@/components/public/ContactCTASection';

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  await connectDB();
  const page = await Page.findOne({ slug: params.slug }).lean() as any;

  if (!page) {
    return { title: "Page Not Found" };
  }

  return {
    title: page.seoTitle || `${page.title} - KSG Energy`,
    description: page.metaDescription,
    keywords: page.metaKeywords?.split ? page.metaKeywords.split(",") : page.metaKeywords,
  };
}

export default async function DynamicPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  
  // Exclude system slugs
  const restrictedSlugs = ['services', 'about', 'contact', 'login', 'admin'];
  if (restrictedSlugs.includes(params.slug)) {
    notFound();
  }

  await connectDB();
  const pageDoc = await Page.findOne({ slug: params.slug, status: 'PUBLISHED' }).lean();

  if (!pageDoc) {
    notFound();
  }

  const page = JSON.parse(JSON.stringify(pageDoc));

  return (
    <main style={{ paddingTop: '100px', paddingBottom: '80px', minHeight: '100vh', backgroundColor: '#ffffff' }}>
      <div className="container" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <header style={{ marginBottom: '40px', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px' }}>
          <h1 style={{ fontSize: '2.5rem', color: '#0f172a', marginBottom: '10px' }}>
            {page.title}
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            Last updated: {new Date(page.updatedAt || page.createdAt).toLocaleDateString()}
          </p>
        </header>

        <div 
          className="page-content"
          style={{ fontSize: '1.05rem', color: '#334155', lineHeight: 1.7 }}
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>

      {/* Why Choose Us */}
      {page.whyChooseUs && page.whyChooseUs.cards && page.whyChooseUs.cards.length > 0 && (
        <WhyChooseUsSection data={page.whyChooseUs} />
      )}

      {/* Testimonials */}
      {page.testimonials && page.testimonials.length > 0 && (
        <TestimonialsSection testimonials={page.testimonials} />
      )}

      {/* FAQ */}
      {page.faq && page.faq.length > 0 && (
        <FAQSection data={page.faq} />
      )}

      {/* Contact CTA */}
      {page.contactCTA && page.contactCTA.heading && (
        <ContactCTASection data={page.contactCTA} />
      )}

    </main>
  );
}
