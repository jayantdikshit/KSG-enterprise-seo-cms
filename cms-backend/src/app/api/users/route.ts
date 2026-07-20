import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import Role from '@/models/Role';
import { withApiAuth } from '@/middleware/apiAuth';
import bcrypt from 'bcryptjs';

export const GET = withApiAuth(async (request: NextRequest) => {
  try {
    await connectDB();
    const users = await User.find()
      .populate('role', 'name')
      .select('-password -refreshToken')
      .sort({ createdAt: -1 });
      
    return NextResponse.json({ success: true, data: users });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}, 'MANAGE_USERS');

export const POST = withApiAuth(async (request: NextRequest) => {
  try {
    await connectDB();
    const body = await request.json();

    const { name, email, password, roleId, isActive } = body;

    if (!name || !email || !password || !roleId) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ success: false, error: 'Email already in use' }, { status: 400 });
    }

    const role = await Role.findById(roleId);
    if (!role) {
      return NextResponse.json({ success: false, error: 'Invalid Role' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: roleId,
      isActive: isActive !== undefined ? isActive : true
    });

    const userObj = newUser.toObject();
    delete userObj.password;

    return NextResponse.json({ success: true, data: userObj }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}, 'MANAGE_USERS');
