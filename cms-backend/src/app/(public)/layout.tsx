import type { Metadata } from "next";
import Script from "next/script";
import { Poppins } from "next/font/google";
import './public.css';
import PublicNavbar from '@/components/public/PublicNavbar';
import PublicFooter from '@/components/public/PublicFooter';
import WhatsAppButton from '@/components/public/WhatsAppButton';
import ScrollToTop from '@/components/public/ScrollToTop';
import { connectDB } from '@/lib/mongodb';
import SeoSetting from '@/models/SeoSetting';
import HomePage from '@/models/HomePage';
import Menu from '@/models/Menu';
import '@/models/Page';
import Service from '@/models/Service';
import '@/models/BlogCategory';

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "KSG Energy - Smart Energy Solutions",
  description: "KSG Energy delivers innovative renewable energy, energy optimization and sustainability solutions for industries and enterprises.",
};

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  let settings = null;
  let homeFooterData = null;
  let headerMenu = null;
  let quickLinksMenu = null;
  let servicesMenu = null;
  let publishedServices = null;

  try {
    await connectDB();
    const settingsDoc = await SeoSetting.findOne({}).lean();
    
    if (settingsDoc) {
      settings = JSON.parse(JSON.stringify(settingsDoc)); // Serialize for client components
    } else {
      // Default fallback if no settings exist
      settings = {
        siteName: "KSG Energy",
        defaultTitle: "KSG Energy - Solar Solutions",
        phone: "+919876543210",
        whatsappNumber: "+919876543210",
        email: "info@ksgenergy.com",
        address: "Noida",
        socialLinks: {}
      };
    }

    // Fetch HomePage for global footer management
    const homeDoc = await HomePage.findOne({ status: 'PUBLISHED' }).select('footer').lean() as any;
    if (homeDoc && homeDoc.footer) {
      homeFooterData = JSON.parse(JSON.stringify(homeDoc.footer));
    }

    // Fetch dynamic menus based on CMS dropdown options
    const hdrMenu = await Menu.findOne({ location: 'header' })
      .populate('items.pageId', 'slug')
      .populate('items.serviceId', 'slug')
      .populate('items.blogCategoryId', 'slug')
      .lean();
    if (hdrMenu) headerMenu = JSON.parse(JSON.stringify(hdrMenu));

    const qlMenu = await Menu.findOne({ location: 'footer_1' })
      .populate('items.pageId', 'slug')
      .populate('items.serviceId', 'slug')
      .populate('items.blogCategoryId', 'slug')
      .lean();
    if (qlMenu) quickLinksMenu = JSON.parse(JSON.stringify(qlMenu));

    const srvMenu = await Menu.findOne({ location: 'footer_2' })
      .populate('items.pageId', 'slug')
      .populate('items.serviceId', 'slug')
      .populate('items.blogCategoryId', 'slug')
      .lean();
    if (srvMenu) servicesMenu = JSON.parse(JSON.stringify(srvMenu));

    // Fetch published services for the navbar dropdown
    const srvs = await Service.find({ status: 'PUBLISHED' }).select('name slug').sort({ createdAt: -1 }).lean();
    if (srvs) publishedServices = JSON.parse(JSON.stringify(srvs));
  } catch (error) {
    console.error("Failed to fetch settings from DB in layout:", error);
  }
  
  return (
    <html lang="en" className={`${poppins.variable} antialiased`}>
      <head>
        {settings?.searchConsoleVerification && (
          <meta name="google-site-verification" content={settings.searchConsoleVerification} />
        )}
        {settings?.googleAnalyticsCode && (
          <>
            <Script strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${settings.googleAnalyticsCode}`} />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${settings.googleAnalyticsCode}');
                `,
              }}
            />
          </>
        )}
        {settings?.googleTagManagerCode && (
          <Script
            id="google-tag-manager"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${settings.googleTagManagerCode}');
              `,
            }}
          />
        )}
      </head>
      <body>
        {settings?.googleTagManagerCode && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${settings.googleTagManagerCode}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}
        <div className="public-wrapper">
          <ScrollToTop />
          <PublicNavbar settings={settings} headerMenu={headerMenu} publishedServices={publishedServices} />
          {children}
          <PublicFooter settings={settings} homeFooterData={homeFooterData} quickLinksMenu={quickLinksMenu} servicesMenu={servicesMenu} />
          <WhatsAppButton phone={settings?.whatsappNumber || settings?.phone} />
        </div>
      </body>
    </html>
  );
}
