"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePermission } from '@/providers/PermissionProvider';

const navItems = [
  { name: 'Dashboard', href: '/admin/dashboard', permission: 'VIEW_DASHBOARD' },
  { name: 'Pages', href: '/admin/pages', permission: 'MANAGE_PAGES' },
  { name: 'Blogs', href: '/admin/blogs', permission: 'MANAGE_BLOGS' },
  { name: 'Services', href: '/admin/services', permission: 'MANAGE_SERVICES' },
  { name: 'Leads', href: '/admin/leads', permission: 'MANAGE_LEADS' },
  { name: 'Media Library', href: '/admin/media', permission: 'MANAGE_MEDIA' },
  { name: 'SEO Settings', href: '/admin/seo', permission: 'MANAGE_SEO' },
  { name: 'Redirects', href: '/admin/redirects', permission: 'MANAGE_SEO' },
  { name: 'Settings', href: '/admin/settings', permission: 'MANAGE_SETTINGS' },
  { name: 'Users', href: '/admin/users', permission: 'MANAGE_USERS' },
  { name: 'Roles', href: '/admin/roles', permission: 'SUPER_ADMIN' },
];

export default function Sidebar() {
  const router = useRouter();
  const { hasPermission } = usePermission();

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 shadow-lg flex flex-col p-4">
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6">Admin Panel</h2>
      <nav className="flex-1 space-y-2">
        {navItems
          .filter((item) => hasPermission(item.permission))
          .map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-3 py-2 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900 text-gray-700 dark:text-gray-300"
            >
              {item.name}
            </Link>
          ))}
      </nav>
      <button
        onClick={() => router.push('/')}
        className="mt-4 w-full text-center text-sm text-gray-500 hover:underline"
      >
        ← Back to site
      </button>
    </aside>
  );
}
