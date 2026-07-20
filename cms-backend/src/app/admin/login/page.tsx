"use client";
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Loader } from '../../../components/admin/common/Loader';

export default function LoginPage() {
  const { login, loading, error } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) router.replace('/admin/dashboard');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 rounded-xl bg-white bg-opacity-90 p-8 shadow-lg backdrop-blur-md"
      >
        <h1 className="text-center text-2xl font-bold text-gray-800">Admin Login</h1>
        {error && <p className="text-center text-sm text-red-600">{error}</p>}
        <div className="flex flex-col space-y-1">
          <label className="text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex flex-col space-y-1">
          <label className="text-sm font-medium text-gray-700">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showPassword ? '🙈' : '👁'}
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <input type="checkbox" id="remember" className="h-4 w-4" />
          <label htmlFor="remember" className="text-sm text-gray-600">
            Remember me
          </label>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-indigo-600 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? <Loader size="sm" /> : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
