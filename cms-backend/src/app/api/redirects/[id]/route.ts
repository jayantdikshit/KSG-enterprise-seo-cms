import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import RedirectModel from '../../../../models/Redirect';
import { connectDB } from '../../../../lib/mongodb';
import { Types } from 'mongoose';

export const runtime = 'nodejs';
import { redirectSchema } from '../../../../validators/redirect.validator';

/**
 * GET /api/redirects/[id]
 * Retrieves a single redirect by its MongoDB ObjectId.
 */
export const GET = async (req: NextRequest) => {
  // Ensure a DB connection is active
  await connectDB();

  const url = new URL(req.url);
  const parts = url.pathname.split('/').filter(Boolean);
  const id = parts[parts.length - 1];

  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json({ success: false, error: 'Invalid id' }, { status: 400 });
  }

  const redirect = await RedirectModel.findById(id).lean();
  if (!redirect) {
    return NextResponse.json({ success: false, error: 'Redirect not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: redirect });
};
export const PUT = async (req: NextRequest) => {
  await connectDB();
  const url = new URL(req.url);
  const parts = url.pathname.split('/').filter(Boolean);
  const id = parts[parts.length - 1];
  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json({ success: false, error: 'Invalid id' }, { status: 400 });
  }
  const body = await req.json();
  const parsed = redirectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.format() }, { status: 400 });
  }
  const updated = await RedirectModel.findByIdAndUpdate(id, parsed.data, { new: true }).lean();
  if (!updated) {
    return NextResponse.json({ success: false, error: 'Redirect not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, data: updated });
};
