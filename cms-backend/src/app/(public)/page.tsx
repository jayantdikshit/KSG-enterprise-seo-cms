import { Metadata } from 'next';
import HeroSection from '@/components/public/HeroSection';
import HomeAboutSection from '@/components/public/HomeAboutSection';
import ServicesSection from '@/components/public/ServicesSection';
import WhyChooseUsSection from '@/components/public/WhyChooseUsSection';
import TestimonialsSection from '@/components/public/TestimonialsSection';
import FAQSection from '@/components/public/FAQSection';
import ContactCTASection from '@/components/public/ContactCTASection';
import { connectDB } from '@/lib/mongodb';
import HomePage from '@/models/HomePage';
import Service from '@/models/Service';
import SeoSetting from '@/models/SeoSetting';

export const dynamic = 'force-dynamic';

async function getHomePageData() {
  await connectDB();
  // Fetch the HomePage and populate the selectedServices
  const doc = await HomePage.findOne({ status: 'PUBLISHED' })
    .populate({
      path: 'services.selectedServices',
      model: Service,
      match: { status: 'PUBLISHED' },
      select: 'name slug shortDescription description featuredImage bannerImage order',
    })
    .lean();

  if (!doc) return null;

  // Convert to plain JSON object
  return JSON.parse(JSON.stringify(doc));
}

// Generate dynamic metadata
export async function generateMetadata(): Promise<Metadata> {
  const data = await getHomePageData();
  
  if (!data || !data.seo) {
    return {
      title: "KSG Energy - Smart Energy Solutions",
      description: "Helping industries and enterprises reduce energy costs through Solar Energy, Energy Audits and Power Optimization Solutions.",
    };
  }

  const seo = data.seo;

  return {
    title: seo.title || "KSG Energy",
    description: seo.metaDescription,
    keywords: seo.metaKeywords,
    alternates: {
      canonical: seo.canonicalUrl,
    },
    openGraph: {
      title: seo.ogTitle || seo.title,
      description: seo.ogDescription || seo.metaDescription,
      images: seo.ogImage ? [{ url: seo.ogImage }] : [],
    },
    twitter: {
      card: (seo.twitterCard as any) || 'summary_large_image',
      title: seo.twitterTitle || seo.title,
      description: seo.twitterDescription || seo.metaDescription,
      images: seo.twitterImage ? [seo.twitterImage] : [],
    },
    robots: {
      index: seo.robotsIndex !== false,
      follow: seo.robotsFollow !== false,
    }
  };
}

export default async function Home() {
  const homeData = await getHomePageData();

  if (!homeData) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-gray-50 rounded-lg shadow-sm">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Homepage Not Found</h1>
          <p className="text-gray-600">Please publish a homepage from the admin panel.</p>
        </div>
      </main>
    );
  }

  return (
    <main>
      {homeData.seo?.schemaMarkup && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: homeData.seo.schemaMarkup }}
        />
      )}

      <HeroSection data={homeData.hero} />
      <HomeAboutSection data={homeData.about} />
      <ServicesSection data={homeData.services} />
      <WhyChooseUsSection data={homeData.whyChooseUs} />
      <TestimonialsSection testimonials={homeData.testimonials} />
      <FAQSection data={homeData.faq} />
      <ContactCTASection data={homeData.contactCTA} />
    </main>
  );
}
