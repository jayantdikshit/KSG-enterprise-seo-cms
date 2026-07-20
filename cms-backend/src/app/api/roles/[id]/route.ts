import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Role from '@/models/Role';
import { withApiAuth } from '@/middleware/apiAuth';
import mongoose from 'mongoose';

export const PUT = withApiAuth(async (request: NextRequest, user, { params }) => {
  try {
    const { id } = params as { id: string };
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid Role ID' }, { status: 400 });
    }

    const body = await request.json();
    await connectDB();
    
    const updatedRole = await Role.findByIdAndUpdate(
      id,
      { permissions: body.permissions || [] },
      { new: true }
    );

    if (!updatedRole) {
      return NextResponse.json({ success: false, error: 'Role not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedRole });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}, 'MANAGE_USERS');
