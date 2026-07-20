import { AuthService } from '../services/AuthService.ts';
// import { connectDB } from '../lib/mongodb'; // optional, AuthService handles DB

(async () => {
  try {
    const data = await AuthService.login('admin@test.com', '123456');
    console.log('Login result:', data);
  } catch (e) {
    console.error('Login error:', e);
  }
  process.exit();
})();
