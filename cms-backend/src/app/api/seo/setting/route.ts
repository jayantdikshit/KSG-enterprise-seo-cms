import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import SeoSettingModel from '../../../../models/SeoSetting';
import { seoSettingSchema } from '../../../../validators/seoSetting.validator';
import { checkRole } from '../../../../middleware/page.middleware';

/**
 * GET  - Retrieve current global SEO settings (single document).
 * POST - Create settings if none exist.
 * PUT  - Update existing settings.
 */

export const GET = async (req: NextRequest) => {
  const settings = await SeoSettingModel.findOne();
  return NextResponse.json({ success: true, data: settings });
};

export const POST = async (req: NextRequest) => {
  const body = await req.json();
  const parsed = seoSettingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.format() }, { status: 400 });
  }
  const existing = await SeoSettingModel.findOne();
  if (existing) {
    return NextResponse.json({ success: false, error: 'SEO settings already exist. Use PUT to update.' }, { status: 409 });
  }
  const created = await SeoSettingModel.create(parsed.data);
  return NextResponse.json({ success: true, data: created }, { status: 201 });
};

export const PUT = async (req: NextRequest) => {
  const body = await req.json();
  const parsed = seoSettingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.format() }, { status: 400 });
  }
  const updated = await SeoSettingModel.findOneAndUpdate({}, parsed.data, { new: true, upsert: true });
  return NextResponse.json({ success: true, data: updated });
};

// Protect all routes with role‑based access (SuperAdmin or Editor)
export const middleware = checkRole(['SuperAdmin', 'Editor']);
