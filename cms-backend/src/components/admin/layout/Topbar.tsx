"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function Topbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    // Navigation is handled inside AuthProvider.logout
  };

  return (
    <header className="flex items-center justify-between bg-white dark:bg-gray-900 px-4 py-2 shadow">
      <div className="flex items-center space-x-2">
        <Link href="/admin/dashboard" className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Admin Dashboard
        </Link>
      </div>
      <div className="flex items-center space-x-4">
        {user && <span className="text-sm text-gray-600 dark:text-gray-400">{user.email}</span>}
        <button onClick={handleLogout} className="text-sm text-indigo-600 hover:underline">
          Logout
        </button>
      </div>
    </header>
  );
}
