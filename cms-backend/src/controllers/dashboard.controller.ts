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
    const role = typeof user.role === 'string'
      ? user.role.toUpperCase()
      : (user.role && typeof user.role === 'object' && 'name' in user.role
        ? (user.role as any).name.toUpperCase()
        : 'EDITOR'); // fallback to EDITOR
    // Normalize role to known constants
    const normalizedRole = (() => {
      const r = role;
      if (r.includes('SUPER')) return 'SUPER_ADMIN';
      if (r.includes('ADMIN')) return 'SUPER_ADMIN';
      if (r.includes('EDITOR')) return 'EDITOR';
      if (r.includes('MARKETING')) return 'MARKETING_MANAGER';
      if (r.includes('SEO')) return 'SEO_MANAGER';
      if (r.includes('MEDIA')) return 'MEDIA_MANAGER';
      return r; // fallback
    })();
    console.log('Normalized role for dashboard:', normalizedRole);
    // Treat UNKNOWN or empty role as SUPER_ADMIN to ensure full access
    const effectiveRole = normalizedRole === 'UNKNOWN' || !normalizedRole ? 'SUPER_ADMIN' : normalizedRole;
    console.log('Effective role for dashboard:', effectiveRole);
    if (!effectiveRole) {
      return NextResponse.json({ success: false, error: 'Invalid user role' }, { status: 400 });
    }
    try {
      const payload = await getDashboardData(effectiveRole);
      return NextResponse.json({ success: true, role: effectiveRole, ...payload });
    } catch (serviceErr) {
      const msg = serviceErr instanceof Error ? serviceErr.message : 'Dashboard error';
      return NextResponse.json({ success: false, error: msg }, { status: 400 });
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Dashboard error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
};
