"use client";
import React, { useEffect } from 'react';
import Sidebar from '@/components/admin/layout/Sidebar';
import Topbar from '@/components/admin/layout/Topbar';
import Breadcrumb from '@/components/admin/layout/Breadcrumb';
import Footer from '@/components/admin/layout/Footer';
import { AuthProvider } from '@/providers/AuthProvider';
import { PermissionProvider } from '@/providers/PermissionProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { ToastProvider } from '@/components/admin/ui/Toast';
import { useAuth } from '@/hooks/useAuth';
import { usePathname, useRouter } from 'next/navigation';

/**
 * Inner component that decides what shell to render based on auth state
 * and current route.
 *
 * - /admin/login  → render children only (no sidebar, topbar, etc.)
 * - other /admin/* → require auth, render full admin shell
 */
function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isLoginPage = pathname.startsWith('/admin/login');

  useEffect(() => {
    if (!loading && !user && !isLoginPage) {
      router.replace('/admin/login');
    }
  }, [user, loading, isLoginPage, router]);

  // ── Login page: render children directly (no admin shell) ──
  if (isLoginPage) {
    return <>{children}</>;
  }

  // ── Still checking auth on initial load ──
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500 font-medium">Loading...</p>
      </div>
    );
  }

  // ── Not authenticated yet (redirecting via useEffect) ──
  if (!user) {
    return null;
  }

  // ── Authenticated → full admin layout ──
  const roleName = typeof user.role === 'object' && user.role ? (user.role as any).name : user.role;

  return (
    <PermissionProvider role={roleName}>
      <ThemeProvider>
        <ToastProvider>
          <div className="flex h-screen overflow-hidden bg-background text-foreground">
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
              <Topbar />
              <Breadcrumb />
              <main className="flex-1 p-6 overflow-y-auto">{children}</main>
              <Footer />
            </div>
          </div>
        </ToastProvider>
      </ThemeProvider>
    </PermissionProvider>
  );
}

export default function AdminClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AuthProvider>
  );
}
