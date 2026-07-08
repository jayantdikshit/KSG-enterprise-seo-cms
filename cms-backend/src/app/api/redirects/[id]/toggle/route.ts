import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import RedirectModel from '../../../../../models/Redirect';
import { connectDB } from '../../../../../lib/mongodb';
import { Types } from 'mongoose';

export const runtime = 'nodejs';

/**
 * PATCH /api/redirects/[id]/toggle
 * Toggles the `active` flag of a redirect.
 */
export const PATCH = async (req: NextRequest) => {
  await connectDB();

  const url = new URL(req.url);
  const parts = url.pathname.split('/').filter(Boolean);
  // parts: ['api','redirects','<id>','toggle']
  const id = parts[parts.length - 2];

  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json({ success: false, error: 'Invalid id' }, { status: 400 });
  }

  const redirect = await RedirectModel.findById(id);
  if (!redirect) {
    return NextResponse.json({ success: false, error: 'Redirect not found' }, { status: 404 });
  }

  redirect.active = !redirect.active;
  await redirect.save();

  return NextResponse.json({ success: true, data: redirect });
};
