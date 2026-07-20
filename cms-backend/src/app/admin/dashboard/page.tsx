"use client";
import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/providers/ThemeProvider';
import { 
  DashboardResponse, 
  DashboardCards, 
  DashboardQuickAction, 
  DashboardRecentActivities,
  RecentActivityItem 
} from '@/types/dashboard';
import { DashboardCharts } from '@/components/admin/dashboard/DashboardCharts';
import { SystemInfoWidget } from '@/components/admin/dashboard/SystemInfoWidget';
import { EmptyState } from '@/components/admin/ui/EmptyState';
import { Activity } from 'lucide-react';

const SkeletonCard = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 animate-pulse">
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
  </div>
);

const SkeletonTable = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 animate-pulse mt-6">
    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
      ))}
    </div>
  </div>
);

const StatCard = React.memo(({ title, value, label }: { title: string, value: string | number, label?: string }) => (
  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-sm hover:shadow-xl p-6 transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-gray-700/50">
    <h2 className="font-medium text-sm text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">{title}</h2>
    <p className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">{value}</p>
    {label && <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{label}</p>}
  </div>
));
StatCard.displayName = 'StatCard';

const ActivityList = React.memo(({ title, items, type }: { title: string, items?: RecentActivityItem[], type: 'page' | 'blog' | 'lead' | 'media' | 'login' }) => {
  if (!items || items.length === 0) return null;
  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 p-6 overflow-hidden">
      <h2 className="font-semibold text-lg mb-4 text-gray-800 dark:text-gray-100 flex items-center"><Activity className="w-5 h-5 mr-2 text-indigo-500"/> {title}</h2>
      <ul className="divide-y divide-gray-100 dark:divide-gray-800">
        {items.map(item => (
          <li key={item._id} className="py-3 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {item.title || item.name || item.originalName || item.email || 'Untitled'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {item.status ? `Status: ${item.status}` : ''} 
                {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}
                {item.uploadedAt ? new Date(item.uploadedAt).toLocaleDateString() : ''}
              </p>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              {type}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
});
ActivityList.displayName = 'ActivityList';

export default function DashboardPage() {
  const { user, loading: authLoading, accessToken } = useAuth();
  const { theme } = useTheme();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/dashboard', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to fetch dashboard data');
      }
      setData(json);
    } catch (err: unknown) {
      console.error('Dashboard Error:', err);
      if (err instanceof Error) {
        setError(err.message || 'An unexpected error occurred');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user && accessToken) {
      fetchDashboard();
    }
  }, [authLoading, user, accessToken]);

  const renderCards = useMemo(() => {
    if (!data?.cards) return null;
    const { cards } = data;
    const widgets = [];

    // Map all potential API values to widgets
    if (cards.pages !== undefined) widgets.push(<StatCard key="pages" title="Total Pages" value={cards.pages} />);
    if (cards.blogs !== undefined) widgets.push(<StatCard key="blogs" title="Total Blogs" value={cards.blogs} />);
    if (cards.draftBlogs !== undefined) widgets.push(<StatCard key="draftBlogs" title="Draft Blogs" value={cards.draftBlogs} />);
    if (cards.publishedBlogs !== undefined) widgets.push(<StatCard key="publishedBlogs" title="Published Blogs" value={cards.publishedBlogs} />);
    if (cards.services !== undefined) widgets.push(<StatCard key="services" title="Total Services" value={cards.services} />);
    if (cards.leads !== undefined) widgets.push(<StatCard key="leads" title="Total Leads" value={cards.leads} />);
    if (cards.newLeads !== undefined) widgets.push(<StatCard key="newLeads" title="New Leads" value={cards.newLeads} />);
    if (cards.qualifiedLeads !== undefined) widgets.push(<StatCard key="qualifiedLeads" title="Qualified Leads" value={cards.qualifiedLeads} />);
    if (cards.closedLeads !== undefined) widgets.push(<StatCard key="closedLeads" title="Closed Leads" value={cards.closedLeads} />);
    if (cards.users !== undefined) widgets.push(<StatCard key="users" title="Total Users" value={cards.users} />);
    if (cards.media !== undefined) widgets.push(<StatCard key="media" title="Total Media" value={cards.media} />);
    if (cards.images !== undefined) widgets.push(<StatCard key="images" title="Images" value={cards.images} />);
    if (cards.pdfs !== undefined) widgets.push(<StatCard key="pdfs" title="PDFs" value={cards.pdfs} />);
    if (cards.activeRedirects !== undefined) widgets.push(<StatCard key="redirects" title="Active Redirects" value={cards.activeRedirects} />);
    if (cards.menus !== undefined) widgets.push(<StatCard key="menus" title="Menus" value={cards.menus} />);
    if (cards.pagesMissingMeta !== undefined) widgets.push(<StatCard key="missingMeta" title="Missing Meta" value={cards.pagesMissingMeta} label="Pages without SEO meta" />);
    if (cards.pagesMissingOg !== undefined) widgets.push(<StatCard key="missingOg" title="Missing OG Image" value={cards.pagesMissingOg} label="Pages without OpenGraph" />);
    if (cards.sitemapStatus !== undefined) widgets.push(<StatCard key="sitemap" title="Sitemap Status" value={String(cards.sitemapStatus)} />);

    return widgets;
  }, [data?.cards]);

  const renderQuickActions = useMemo(() => {
    if (!data?.quickActions || data.quickActions.length === 0) return null;
    return (
      <div className="mt-6 flex flex-wrap gap-3">
        {data.quickActions.map((action, idx) => (
          <Link key={idx} href={action.href} className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
            {action.label}
          </Link>
        ))}
      </div>
    );
  }, [data?.quickActions]);

  const recent = data?.recentActivities || data?.recent;

  if (authLoading || (loading && !data)) {
    return (
      <div className="p-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <SkeletonTable />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md p-4">
          <h3 className="text-lg font-medium text-red-800 dark:text-red-200">Dashboard Error</h3>
          <div className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</div>
          <button 
            onClick={fetchDashboard}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome, {user?.email ?? 'Admin'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Role: <span className="font-semibold text-blue-600 dark:text-blue-400">{data?.role}</span>
          </p>
        </div>
        {renderQuickActions}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {renderCards}
      </div>

      {data?.charts && (
        <DashboardCharts 
          monthlyLeads={data.charts.monthlyLeads} 
          monthlyBlogs={data.charts.monthlyBlogs} 
        />
      )}

      {recent && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityList title="Recent Pages" items={recent.recentPages} type="page" />
          <ActivityList title="Recent Blogs" items={recent.recentBlogs} type="blog" />
          <ActivityList title="Recent Leads" items={recent.recentLeads} type="lead" />
          <ActivityList title="Recent Media" items={recent.recentMedia} type="media" />
          <ActivityList title="Recent Logins" items={recent.recentLogins} type="login" />
        </div>
      )}
      
      {data?.systemInfo && (
        <SystemInfoWidget 
          systemInfo={data.systemInfo} 
          userEmail={user?.email || 'Unknown'} 
          role={data.role} 
        />
      )}

      {/* Fallback for empty activities */}
      {recent && Object.values(recent).every(arr => !arr || arr.length === 0) && (
        <div className="mt-8">
          <EmptyState 
            title="No Recent Activity" 
            description="Your dashboard is quiet. Check back later when users interact with the CMS." 
            icon={<Activity className="w-8 h-8 text-indigo-500" />} 
          />
        </div>
      )}
    </div>
  );
}
