import { redirect } from 'next/navigation';

export default function AdminRootPage() {
  // Redirect to login if accessing /admin directly
  redirect('/admin/login');
  return null;
}
