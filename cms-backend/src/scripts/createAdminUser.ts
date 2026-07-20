import { AuthService } from '@/services/AuthService';
import { connectDB } from '@/lib/mongodb';

(async () => {
  try {
    await connectDB();
    const admin = await AuthService.register({
      name: 'Admin User',
      email: 'admin@test.com',
      password: '123456',
      role: 'SUPER_ADMIN', // you can use any role that exists in your seedRoles
    });
    console.log('✅ Admin user created:', admin);
  } catch (e) {
    console.error('❌ Error creating admin user:', e);
  }
  process.exit();
})();
