import { 
  countPages,
  countBlogs,
  countDraftBlogs,
  countPublishedBlogs,
  countServices,
  countLeads,
  countUsers,
  countMediaFiles,
  countActiveRedirects,
  countMenus,
  countNewLeads,
  countQualifiedLeads,
  countClosedLeads,
  leadsPerMonth,
  leadsPerDay,
  blogsPerMonth,
  servicesCreatedPerMonth,
  recentLeads,
  recentBlogs,
  recentPages,
  recentMedia,
  recentLogins,
  countSeoPagesMissingMeta,
  countSeoPagesMissingOgImage,
  getSitemapStatus,
  getSeoScore,
  countIndexedPages,
  countImages,
  countPDFs,
  getUploadTrend
} from '../repositories/dashboard.repository';
import mongoose from 'mongoose';

// Quick‑action definitions – adjust URLs if needed
const quickActions = {
  SUPER_ADMIN: [
    { label: 'Create Page', href: '/admin/pages/create' },
    { label: 'Create Blog', href: '/admin/blogs/create' },
    { label: 'Upload Media', href: '/admin/media?upload=true' },
    { label: 'Create Service', href: '/admin/services/create' }
  ],
  EDITOR: [
    { label: 'New Blog', href: '/admin/blogs/create' },
    { label: 'New Page', href: '/admin/pages/create' }
  ],
  MARKETING_MANAGER: [
    { label: 'Export Leads', href: '/admin/leads/export' },
    { label: 'Update Lead Status', href: '/admin/leads/update-status' }
  ],
  SEO_MANAGER: [
    { label: 'Edit SEO', href: '/admin/seo/edit' },
    { label: 'Create Redirect', href: '/admin/redirects/create' }
  ],
  MEDIA_MANAGER: [
    { label: 'Upload Image', href: '/admin/media?upload=true' },
    { label: 'Upload PDF', href: '/admin/media?upload=true' }
  ]
};

/**
 * Assemble dashboard payload for each role.
 */
export const getDashboardData = async (role: string) => {
  switch (role) {
    case 'SUPER_ADMIN':
      return await buildSuperAdmin();
    case 'EDITOR':
      return await buildEditor();
    case 'MARKETING_MANAGER':
      return await buildMarketingManager();
    case 'SEO_MANAGER':
      return await buildSeoManager();
    case 'MEDIA_MANAGER':
      return await buildMediaManager();
    default:
      throw new Error('Unsupported role');
  }
};

/** Super Admin – full access */
const buildSuperAdmin = async () => {
  const [pages, blogs, services, leads, newLeads, qualifiedLeads, closedLeads, users, media, activeRedirects, menus] = await Promise.all([
    countPages(),
    countBlogs(),
    countServices(),
    countLeads(),
    countNewLeads(),
    countQualifiedLeads(),
    countClosedLeads(),
    countUsers(),
    countMediaFiles(),
    countActiveRedirects(),
    countMenus()
  ]);

  const [monthlyLeads, dailyLeads, monthlyBlogs, servicesCreated] = await Promise.all([
    leadsPerMonth(),
    leadsPerDay(),
    blogsPerMonth(),
    servicesCreatedPerMonth()
  ]);

  const recentActivities = {
    recentLeads: await recentLeads(5),
    recentBlogs: await recentBlogs(5),
    recentPages: await recentPages(5),
    recentMedia: await recentMedia(5),
    recentLogins: await recentLogins(5)
  };

  const systemInfo = {
    serverStatus: 'Online',
    databaseStatus: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    uptime: process.uptime()
  };

  return {
    cards: { pages, blogs, services, leads, newLeads, qualifiedLeads, closedLeads, users, media, activeRedirects, menus },
    charts: { monthlyLeads, dailyLeads, monthlyBlogs, servicesCreated },
    recentActivities,
    quickActions: quickActions.SUPER_ADMIN,
    systemInfo
  };
};

/** Editor – content only */
const buildEditor = async () => {
  const [pages, blogs, draftBlogs, publishedBlogs] = await Promise.all([
    countPages(),
    countBlogs(),
    countDraftBlogs(),
    countPublishedBlogs()
  ]);

  const recent = {
    recentPages: await recentPages(5),
    recentBlogs: await recentBlogs(5)
  };

  return {
    cards: { pages, blogs, draftBlogs, publishedBlogs },
    recent,
    quickActions: quickActions.EDITOR
  };
};

/** Marketing Manager – leads & blog stats */
const buildMarketingManager = async () => {
  const [totalLeads, newLeads, qualifiedLeads, closedLeads, totalBlogs] = await Promise.all([
    countLeads(),
    countNewLeads(),
    countQualifiedLeads(),
    countClosedLeads(),
    countBlogs()
  ]);

  const leadChart = await leadsPerMonth(); // could be extended to status/source charts
  const dailyLeads = await leadsPerDay();

  return {
    cards: { totalLeads, newLeads, qualifiedLeads, closedLeads, totalBlogs },
    charts: { leadChart, dailyLeads },
    quickActions: quickActions.MARKETING_MANAGER
  };
};

/** SEO Manager – SEO health */
const buildSeoManager = async () => {
  const [pagesMissingMeta, pagesMissingOg, redirects, sitemapStatus] = await Promise.all([
    countSeoPagesMissingMeta(),
    countSeoPagesMissingOgImage(),
    countActiveRedirects(),
    getSitemapStatus()
  ]);

  const [seoScore, indexedPages] = await Promise.all([
    getSeoScore(),
    countIndexedPages()
  ]);

  return {
    cards: { pages: await countPages(), pagesMissingMeta, pagesMissingOg, redirects, sitemapStatus },
    charts: { seoScore, indexedPages },
    quickActions: quickActions.SEO_MANAGER
  };
};

/** Media Manager – media inventory */
const buildMediaManager = async () => {
  const [images, pdfs, storageUsed] = await Promise.all([
    countImages(),
    countPDFs(),
    countMediaFiles()
  ]);

  const uploadTrend = await getUploadTrend();

  return {
    cards: { images, pdfs, storageUsed },
    charts: { uploadTrend },
    quickActions: quickActions.MEDIA_MANAGER
  };
};
