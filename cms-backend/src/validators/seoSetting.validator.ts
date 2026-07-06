import { z } from 'zod';

export const seoSettingSchema = z.object({
  siteName: z.string().min(1, 'Site name required'),
  defaultTitle: z.string().optional(),
  defaultDescription: z.string().optional(),
  defaultKeywords: z.string().optional(),
  defaultCanonicalUrl: z.string().url().optional(),
  defaultOgImage: z.string().url().optional(),
  googleAnalyticsCode: z.string().optional(),
  googleTagManagerCode: z.string().optional(),
  searchConsoleVerification: z.string().optional(),
  bingVerification: z.string().optional(),
  facebookVerification: z.string().optional(),
  twitterHandle: z.string().optional(),
});
