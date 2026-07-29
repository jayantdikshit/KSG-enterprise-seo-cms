import AboutSection from '@/components/public/AboutSection';
import WhyChooseUsSection from '@/components/public/WhyChooseUsSection';
import TestimonialsSection from '@/components/public/TestimonialsSection';
import FAQSection from '@/components/public/FAQSection';
import ContactCTASection from '@/components/public/ContactCTASection';
export const dynamic = 'force-dynamic';
import { connectDB } from '@/lib/mongodb';
import About from '@/models/About';

export async function generateMetadata() {
  await connectDB();
  const doc = await About.findOne({}).lean() as any;
  
  if (!doc) {
    return {
      title: "About Us - KSG Energy",
      description: "Learn more about KSG Energy and our mission to provide sustainable energy solutions.",
    };
  }

  const seoTitle = doc.seoTitle || "About Us - KSG Energy";
  const metaDesc = doc.metaDescription || "Learn more about KSG Energy and our mission to provide sustainable energy solutions.";
  const canonicalUrl = doc.canonicalUrl || "https://example.com/about"; // Adjust domain as needed or leave relative

  return {
    title: seoTitle,
    description: metaDesc,
    keywords: doc.metaKeywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: doc.ogTitle || seoTitle,
      description: doc.ogDescription || metaDesc,
      images: doc.ogImage ? [{ url: doc.ogImage }] : [],
    },
    twitter: {
      card: (doc.twitterCard as any) || 'summary_large_image',
      title: doc.ogTitle || seoTitle,
      description: doc.ogDescription || metaDesc,
      images: doc.ogImage ? [doc.ogImage] : [],
    },
  };
}

export default async function AboutPage() {
  let aboutData = null;

  try {
    await connectDB();
    const doc = await About.findOne({}).lean();
    if (doc) {
      aboutData = JSON.parse(JSON.stringify(doc));
    }
  } catch (error) {
    console.error("Error fetching about data:", error);
  }

  return (
    <main style={{ paddingTop: '80px' }}>
      <AboutSection aboutData={aboutData} />
      {aboutData?.whyChooseUs && <WhyChooseUsSection data={aboutData.whyChooseUs} />}
      {aboutData?.testimonials && aboutData.testimonials.length > 0 && <TestimonialsSection testimonials={aboutData.testimonials} />}
      {aboutData?.faq && aboutData.faq.length > 0 && <FAQSection data={aboutData.faq} />}
      {aboutData?.contactCTA && <ContactCTASection data={aboutData.contactCTA} />}
    </main>
  );
}
