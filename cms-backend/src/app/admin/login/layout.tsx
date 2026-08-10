import { connectDB } from '@/lib/mongodb';
import SeoSetting from '@/models/SeoSetting';
import Menu from '@/models/Menu';
import Service from '@/models/Service';
import '@/models/Page';
import '@/models/BlogCategory';
import PublicNavbar from '@/components/public/PublicNavbar';

export default async function LoginLayout({ children }: { children: React.ReactNode }) {
  let settings = null;
  let headerMenu = null;
  let publishedServices = null;

  try {
    await connectDB();

    const [settingsDoc, hdrMenu, srvs] = await Promise.all([
      SeoSetting.findOne({}).lean(),
      Menu.findOne({ location: 'header' })
        .populate('items.pageId', 'slug')
        .populate('items.serviceId', 'slug')
        .populate('items.blogCategoryId', 'slug')
        .lean(),
      Service.find({ status: 'PUBLISHED' }).select('name slug').sort({ createdAt: -1 }).lean(),
    ]);

    if (settingsDoc) settings = JSON.parse(JSON.stringify(settingsDoc));
    if (hdrMenu) headerMenu = JSON.parse(JSON.stringify(hdrMenu));
    if (srvs) publishedServices = JSON.parse(JSON.stringify(srvs));
  } catch (error) {
    console.error('Failed to fetch navbar data for login layout:', error);
  }

  return (
    <>
      <PublicNavbar settings={settings} headerMenu={headerMenu} publishedServices={publishedServices} />
      {children}
    </>
  );
}
