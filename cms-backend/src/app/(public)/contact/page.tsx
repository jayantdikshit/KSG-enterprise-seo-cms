import ContactSection from '@/components/public/ContactSection';
import { connectDB } from '@/lib/mongodb';
import SeoSetting from '@/models/SeoSetting';
import HomePage from '@/models/HomePage';

export const metadata = {
  title: "Contact Us - KSG Energy",
  description: "Get in touch with KSG Energy for smart energy solutions, energy audits, and solar panel installation.",
};

export default async function ContactPage() {
  let settings = null;

  try {
    await connectDB();
    const [doc, homeDoc] = await Promise.all([
      SeoSetting.findOne({}).lean(),
      HomePage.findOne({ status: 'PUBLISHED' }).select('footer').lean() as any
    ]);
    
    let combinedSettings: any = {};
    if (doc) {
      combinedSettings = JSON.parse(JSON.stringify(doc));
    }
    if (homeDoc && homeDoc.footer) {
      combinedSettings.phone = homeDoc.footer.phone;
      combinedSettings.email = homeDoc.footer.email;
      combinedSettings.address = homeDoc.footer.address;
    }
    settings = combinedSettings;
  } catch (error) {
    console.error("Error fetching settings for contact:", error);
  }

  return (
    <main style={{ paddingTop: '40px' }}>
      <ContactSection settings={settings} />
    </main>
  );
}
