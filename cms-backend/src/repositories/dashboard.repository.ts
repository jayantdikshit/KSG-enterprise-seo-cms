// Dashboard Repository – data aggregation functions for role‑based dashboard
import Page from '../models/Page';
import Blog from '../models/Blog';
import Service from '../models/Service';
import Lead from '../models/Lead';
import User from '../models/User';
import Media from '../models/Media';
import Redirect from '../models/Redirect';
import Menu from '../models/Menu';
import SeoSetting from '../models/SeoSetting';

/** Simple count helpers */
export const countPages = async () => Page.countDocuments();
export const countBlogs = async () => Blog.countDocuments();
export const countDraftBlogs = async () => Blog.countDocuments({ status: 'draft' });
export const countPublishedBlogs = async () => Blog.countDocuments({ status: 'published' });
export const countServices = async () => Service.countDocuments();
export const countLeads = async () => Lead.countDocuments();
export const countUsers = async () => User.countDocuments();
export const countMediaFiles = async () => Media.countDocuments();
export const countActiveRedirects = async () => Redirect.countDocuments({ active: true });
export const countMenus = async () => Menu.countDocuments();

/** Chart aggregations */
export const leadsPerMonth = async () =>
  Lead.aggregate([
    { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);

export const blogsPerMonth = async () =>
  Blog.aggregate([
    { $match: { status: 'published' } },
    { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);

export const servicesCreatedPerMonth = async () =>
  Service.aggregate([
    { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);

/** Recent activity helpers */
export const recentLeads = async (limit = 5) => Lead.find().sort({ createdAt: -1 }).limit(limit);
export const recentBlogs = async (limit = 5) => Blog.find().sort({ updatedAt: -1 }).limit(limit);
export const recentPages = async (limit = 5) => Page.find().sort({ updatedAt: -1 }).limit(limit);
export const recentMedia = async (limit = 5) => Media.find().sort({ uploadedAt: -1 }).limit(limit);
export const recentLogins = async (limit = 5) =>
  User.find({ "loginAttempts": { $gt: 0 } })
    .sort({ updatedAt: -1 })
    .limit(limit);

/** SEO specific helpers */
export const countSeoPagesMissingMeta = async () =>
  Page.countDocuments({ meta: { $exists: false } });
export const countSeoPagesMissingOgImage = async () =>
  Page.countDocuments({ ogImage: { $exists: false } });
export const getSitemapStatus = async () => {
  const setting = await SeoSetting.findOne({ key: 'sitemap' }).lean();
  return setting?.value || 'unknown';
};
export const getSeoScore = async () => {
  const setting = await SeoSetting.findOne({ key: 'seoScore' }).lean();
  return setting?.value || 0;
};
export const countIndexedPages = async () => {
  // Assuming a field `indexed` on Page indicates if Google indexed it
  return Page.countDocuments({ indexed: true });
};

/** Media manager helpers */
export const countImages = async () => Media.countDocuments({ type: 'image' });
export const countPDFs = async () => Media.countDocuments({ type: 'pdf' });
export const getUploadTrend = async () =>
  Media.aggregate([
    { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$uploadedAt" } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);
// Additional marketing manager helpers
export const countNewLeads = async () => Lead.countDocuments({ status: 'NEW' });
export const countQualifiedLeads = async () => Lead.countDocuments({ status: 'QUALIFIED' });
export const countClosedLeads = async () => Lead.countDocuments({ status: 'CLOSED' });

export const leadStatusChart = async () =>
  Lead.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);

export const leadSourcesChart = async () =>
  Lead.aggregate([
    { $group: { _id: '$source', count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);

