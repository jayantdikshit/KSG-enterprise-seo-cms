import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import SeoService from '../../../../services/seo.service';

/**
 * GET /api/seo/sitemap
 * Returns a dynamically generated sitemap.xml.
 * The response is plain XML with proper Content‑Type.
 */
export const GET = async (req: NextRequest) => {
  // Build base URL from request headers (works locally and in production)
  const proto = req.headers.get('x-forwarded-proto') ?? 'http';
  const host = req.headers.get('host') ?? '';
  const baseUrl = `${proto}://${host}`;

  const sitemapXml = await SeoService.generateSitemap(baseUrl);
  return new NextResponse(sitemapXml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
