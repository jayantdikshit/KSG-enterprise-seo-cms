import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import Role from '@/models/Role';
import { hashPassword } from '@/utils/password';
import { seedRoles } from '@/utils/seed';

/**
 * GET /api/auth/seed
 * Seeds the database with default roles and an admin user.
 * Safe to call multiple times — skips if admin already exists.
 */
export async function GET() {
  try {
    await connectDB();
    await seedRoles();

    // Check if admin user already exists
    const existing: any = await User.findOne({ email: 'admin@test.com' });
    if (existing) {
      // Re-link to the freshly-seeded SUPER_ADMIN role
      const adminRole = await Role.findOne({ name: 'SUPER_ADMIN' });
      if (adminRole) {
        existing.role = adminRole._id;
        await existing.save();
      }
      return NextResponse.json({
        success: true,
        message: 'Admin user already exists. Roles re-seeded and role re-linked.',
        user: { email: existing.email, id: existing._id },
      });
    }

    // Find the SUPER_ADMIN role
    const adminRole = await Role.findOne({ name: 'SUPER_ADMIN' });
    if (!adminRole) {
      throw new Error('SUPER_ADMIN role not found after seeding');
    }

    // Create admin user
    const hashedPw = await hashPassword('123456');
    const adminUser: any = await User.create({
      name: 'Admin',
      email: 'admin@test.com',
      password: hashedPw,
      role: adminRole._id,
    } as any);

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      user: { email: adminUser.email, id: adminUser._id },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Seed failed';
    console.error('❌ Seed error:', error);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
