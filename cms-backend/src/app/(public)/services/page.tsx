import ServicesSection from '@/components/public/ServicesSection';
import WhyChooseUsSection from '@/components/public/WhyChooseUsSection';
export const dynamic = 'force-dynamic';
import TestimonialsSection from '@/components/public/TestimonialsSection';
import FAQSection from '@/components/public/FAQSection';
import ContactCTASection from '@/components/public/ContactCTASection';
import { connectDB } from '@/lib/mongodb';
import Service from '@/models/Service';
import PageModel from '@/models/Page';

export async function generateMetadata() {
  try {
    await connectDB();
    const page: any = await PageModel.findOne({ slug: 'services', status: 'PUBLISHED' }).lean();
    
    if (page) {
      return {
        title: page.seoTitle || page.title,
        description: page.metaDescription,
        keywords: page.metaKeywords,
      };
    }
  } catch (error) {
    console.error("Error fetching services page metadata:", error);
  }

  return {
    title: "Our Services - KSG Energy",
    description: "Explore our wide range of energy efficiency, solar, and optimization services.",
  };
}

export default async function ServicesPage() {
  let activeServices = [];
  let pageContent: any = null;

  try {
    await connectDB();
    const servicesList = await Service.find({ status: 'PUBLISHED' }).sort({ createdAt: -1 }).lean();
    activeServices = JSON.parse(JSON.stringify(servicesList));

    const page = await PageModel.findOne({ slug: 'services', status: 'PUBLISHED' }).lean();
    if (page) {
      pageContent = JSON.parse(JSON.stringify(page));
    }
  } catch (error) {
    console.error("Error fetching services data:", error);
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#0f172a' }}>
      <div 
        style={{ 
          padding: '120px 20px 80px',
          backgroundImage: 'linear-gradient(rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.95)), url("https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=2000")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          textAlign: 'center',
          color: '#f8fafc'
        }}
      >
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 'bold', marginBottom: '20px' }}>
            {pageContent ? pageContent.title : "Energy Solutions"}
          </h1>
          {pageContent && pageContent.content ? (
            <div 
              style={{ fontSize: '1.15rem', lineHeight: '1.8', color: '#cbd5e1' }}
              dangerouslySetInnerHTML={{ __html: pageContent.content.replace(/color:\s*#[a-zA-Z0-9]+/g, 'color: inherit') }}
            />
          ) : (
            <p style={{ fontSize: '1.15rem', lineHeight: '1.8', color: '#cbd5e1' }}>
              We provide comprehensive energy efficiency, solar, and optimization services to help your business reduce costs and achieve sustainability goals.
            </p>
          )}
        </div>
      </div>
      <ServicesSection data={{ selectedServices: activeServices, showSection: true }} />
      
      {/* Dynamic Sections from Page Content */}
      {pageContent?.whyChooseUs?.cards?.length > 0 && (
        <WhyChooseUsSection data={pageContent.whyChooseUs} />
      )}

      {pageContent?.testimonials?.length > 0 && (
        <TestimonialsSection testimonials={pageContent.testimonials} />
      )}

      {pageContent?.faq?.length > 0 && (
        <FAQSection data={pageContent.faq} />
      )}

      {pageContent?.contactCTA?.heading && (
        <ContactCTASection data={pageContent.contactCTA} />
      )}
    </main>
  );
}
