import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '../lib/auth';
import { getDashboardData } from '../services/dashboard.service';

/**
 * GET /api/dashboard
 * Extract JWT from Authorization header, determine user role, and return role‑specific dashboard payload.
 */
export const GET = async (req: NextRequest) => {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Missing Authorization header' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    const payload = await getDashboardData(user.role);
    return NextResponse.json({ success: true, role: user.role, ...payload });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Dashboard error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
};
