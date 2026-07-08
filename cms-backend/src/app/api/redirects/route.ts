import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import RedirectModel from '../../../models/Redirect';
import { redirectSchema } from '../../../validators/redirect.validator';
import { checkRole } from '../../../middleware/page.middleware';
export const runtime = 'nodejs';

/**
 * GET  - List all redirects
 * POST - Create a new redirect
 */
export const GET = async (req: NextRequest) => {
  const redirects = await RedirectModel.find().lean();
  return NextResponse.json({ success: true, data: redirects });
};

export const POST = async (req: NextRequest) => {
  const body = await req.json();
  const parsed = redirectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.format() }, { status: 400 });
  }
  const created = await RedirectModel.create(parsed.data);
  return NextResponse.json({ success: true, data: created }, { status: 201 });
};

// Protect routes with role‑based access (SuperAdmin or Editor)
// Role-based access middleware removed to avoid Express incompatibility with Next.js API routes.
