import mongoose from 'mongoose';

 
import { SitemapStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';
import { connectDB } from '../lib/mongodb';
import SeoSettingModel from '../models/SeoSetting';
import PageModel from '../models/Page';
import ServiceModel from '../models/Service';
import BlogModel from '../models/Blog';

/**
 * SEO Service responsible for generating dynamic SEO assets.
 * - sitemap.xml
 * - robots.txt
 * - JSON-LD schema markup (organization, website, breadcrumb)
 */
class SeoService {
  /** Generate sitemap XML based on published pages, services and blogs */
  static async generateSitemap(baseUrl: string): Promise<string> {
    // Ensure DB connection before any query
    await connectDB();
    const sitemap = new SitemapStream({ hostname: baseUrl });
    const docs: Array<{ url: string; lastmod?: Date; changefreq: string; priority: number }> = [];

    // Add static pages
    docs.push({ url: '/', changefreq: 'daily', priority: 1.0 });
    docs.push({ url: '/about', changefreq: 'monthly', priority: 0.8 });
    docs.push({ url: '/contact', changefreq: 'monthly', priority: 0.8 });
    docs.push({ url: '/services', changefreq: 'weekly', priority: 0.9 });
    docs.push({ url: '/blog', changefreq: 'daily', priority: 0.9 });

    // Helper to push docs from a model
    const pushFromModel = async (Model: mongoose.Model<unknown>, pathPrefix: string, priority: number) => {
      const items = await Model.find({ status: 'PUBLISHED' }).select('slug updatedAt');
      items.forEach((item: any) => {
        const loc = `${pathPrefix}/${item.slug}`;
        docs.push({ url: loc, lastmod: item.updatedAt, changefreq: 'weekly', priority });
      });
    };

    await Promise.all([
      pushFromModel(PageModel, '', 0.7),
      pushFromModel(ServiceModel, '/services', 0.9),
      pushFromModel(BlogModel, '/blog', 0.8),
    ]);

    const stream = Readable.from(docs);
    stream.pipe(sitemap);
    const data = await streamToPromise(sitemap);
    return data.toString();
  }

  /** Generate a simple robots.txt allowing everything */
  static async generateRobotsTxt(): Promise<string> {
    return `User-agent: *\nAllow: /\nSitemap: ${process.env.BASE_URL || '/'}sitemap.xml`;
  }

  /** Generate JSON-LD schema markup for organization */
  static async organizationSchema(): Promise<string> {
    const settings = await SeoSettingModel.findOne();
    const org = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: settings?.siteName || 'My Site',
      url: settings?.defaultCanonicalUrl || process.env.BASE_URL || '',
      logo: settings?.defaultOgImage || '',
    };
    return JSON.stringify(org, null, 2);
  }

  /** Generate JSON-LD website schema */
  static async websiteSchema(): Promise<string> {
    const settings = await SeoSettingModel.findOne();
    const site = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: settings?.defaultTitle || 'My Site',
      url: settings?.defaultCanonicalUrl || process.env.BASE_URL || '',
    };
    return JSON.stringify(site, null, 2);
  }

  /** Generate JSON-LD breadcrumb schema based on a breadcrumb list */
  static breadcrumbSchema(breadcrumbs: Array<{ name: string; url: string }>): string {
    const items = breadcrumbs.map((bc, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: bc.name,
      item: bc.url,
    }));
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items,
    };
    return JSON.stringify(schema, null, 2);
  }
}

export default SeoService;
