import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { SitemapStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';
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
    const sitemap = new SitemapStream({ hostname: baseUrl });
    const docs: Array<{ loc: string; lastmod?: Date }> = [];

    // Helper to push docs from a model
    const pushFromModel = async (Model: mongoose.Model<any>, pathPrefix: string) => {
      const items = await Model.find({ status: 'PUBLISHED' }).select('_id updatedAt');
      items.forEach((item: any) => {
        const loc = `${pathPrefix}/${item._id}`;
        docs.push({ loc, lastmod: item.updatedAt });
      });
    };

    await Promise.all([
      pushFromModel(PageModel, '/page'),
      pushFromModel(ServiceModel, '/service'),
      pushFromModel(BlogModel, '/blog'),
    ]);

    const stream = Readable.from(docs.map(d => ({ url: d.loc, lastmod: d.lastmod })));
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
