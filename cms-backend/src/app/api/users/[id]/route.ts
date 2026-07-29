import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import Role from '@/models/Role';
import { withApiAuth } from '@/middleware/apiAuth';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export const PUT = withApiAuth(async (request: NextRequest, user, { params }) => {
  try {
    const { id } = (await params) as { id: string };
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid User ID' }, { status: 400 });
    }

    await connectDB();
    const body = await request.json();
    const { name, email, password, roleId, isActive } = body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: id } });
      if (existingUser) return NextResponse.json({ success: false, error: 'Email already in use' }, { status: 400 });
      updateData.email = email;
    }
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    if (roleId) {
      const role = await Role.findById(roleId);
      if (!role) return NextResponse.json({ success: false, error: 'Invalid Role' }, { status: 400 });
      updateData.role = roleId;
    }
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true })
      .populate('role', 'name')
      .select('-password -refreshToken');

    if (!updatedUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}, 'MANAGE_USERS');

export const DELETE = withApiAuth(async (request: NextRequest, user, { params }) => {
  try {
    const { id } = (await params) as { id: string };
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid User ID' }, { status: 400 });
    }

    await connectDB();
    
    // Prevent deleting the last SUPER_ADMIN or self. But for now just simple delete.
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { _id: id } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}, 'MANAGE_USERS');
