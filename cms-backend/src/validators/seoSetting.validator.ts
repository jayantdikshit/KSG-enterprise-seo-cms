import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { SeoSettingModel } from '@/models/seoSetting';

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

// Partial schema for updates – all fields optional
export const seoSettingUpdateSchema = seoSettingSchema.partial();
