import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Role from '@/models/Role';
import { withApiAuth } from '@/middleware/apiAuth';

export const GET = withApiAuth(async (request: NextRequest) => {
  try {
    await connectDB();
    const roles = await Role.find().sort({ createdAt: 1 });
    return NextResponse.json({ success: true, data: roles });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}, 'MANAGE_USERS');
