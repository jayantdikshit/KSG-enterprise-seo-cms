export interface DashboardQuickAction {
  label: string;
  href: string;
}

export interface DashboardCards {
  pages?: number;
  blogs?: number;
  draftBlogs?: number;
  publishedBlogs?: number;
  services?: number;
  leads?: number;
  users?: number;
  media?: number;
  activeRedirects?: number;
  menus?: number;
  totalLeads?: number;
  newLeads?: number;
  qualifiedLeads?: number;
  closedLeads?: number;
  totalBlogs?: number;
  pagesMissingMeta?: number;
  pagesMissingOg?: number;
  redirects?: number;
  sitemapStatus?: string | boolean;
  images?: number;
  pdfs?: number;
  storageUsed?: number;
}

export interface DashboardChartData {
  _id: string; // Date or status string
  count: number;
}

export interface DashboardCharts {
  monthlyLeads?: DashboardChartData[];
  monthlyBlogs?: DashboardChartData[];
  servicesCreated?: DashboardChartData[];
  leadChart?: DashboardChartData[];
  seoScore?: number;
  indexedPages?: number;
  uploadTrend?: DashboardChartData[];
}

export interface RecentActivityItem {
  _id: string;
  title?: string; // For pages/blogs/services
  name?: string; // For leads
  email?: string; // For leads/users
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  uploadedAt?: string;
  originalName?: string; // For media
}

export interface DashboardRecentActivities {
  recentLeads?: RecentActivityItem[];
  recentBlogs?: RecentActivityItem[];
  recentPages?: RecentActivityItem[];
  recentMedia?: RecentActivityItem[];
  recentLogins?: RecentActivityItem[];
}

export interface DashboardResponse {
  success: boolean;
  role: string;
  cards?: DashboardCards;
  charts?: DashboardCharts;
  recentActivities?: DashboardRecentActivities;
  recent?: DashboardRecentActivities; // Editor role uses 'recent'
  quickActions?: DashboardQuickAction[];
  error?: string;
}
