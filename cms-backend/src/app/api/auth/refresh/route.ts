import { NextResponse } from 'next/server';
import { AuthService } from '@/services/AuthService';
import { cookies } from 'next/headers';

/**
 * POST /api/auth/refresh
 * Accepts a refresh token either in the request body as { refreshToken }
 * or from an HttpOnly cookie named "refreshToken".
 * Returns a new access token.
 */
export async function POST(req: Request) {
  try {
    // Try to read JSON body first
    let refreshToken: string | undefined;
    try {
      const body = await req.json();
      if (body && typeof body.refreshToken === 'string') {
        refreshToken = body.refreshToken;
      }
    } catch {
      // ignore JSON parse errors – fallback to cookie
    }

    // Fallback to cookie if not provided in body
    if (!refreshToken) {
      const cookieStore = await cookies();
      const cookie = cookieStore.get('refreshToken');
      if (cookie) refreshToken = cookie.value;
    }

    if (!refreshToken) {
      throw new Error('Refresh token not provided');
    }

    const result = await AuthService.refresh(refreshToken);
    return NextResponse.json({ success: true, accessToken: result.accessToken, user: result.user });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Token refresh failed';
    return NextResponse.json({ success: false, message }, { status: 401 });
  }
}