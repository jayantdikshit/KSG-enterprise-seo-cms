import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import SeoService from '../../../../services/seo.service';

/**
 * GET /api/seo/robots
 * Returns the generated robots.txt content.
 * This endpoint is publicly accessible – no auth required.
 */
export const GET = async (req: NextRequest) => {
  const robotsTxt = await SeoService.generateRobotsTxt();
  return new NextResponse(robotsTxt, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
