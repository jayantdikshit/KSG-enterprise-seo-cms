import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const blogBaseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  
  slug: z
    .preprocess(
      (val) => (typeof val === "string" ? val.toLowerCase().trim() : val),
      z.string()
        .min(3, "Slug must be at least 3 characters")
        .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens")
    ),
  
  content: z.string().min(1, "Content is required"),
  
  featuredImage: z.string().optional(),
  authorName: z.string().optional(),
  author: z.string().regex(objectIdRegex, "Invalid Author ID format").optional(),
  
  category: z.string().regex(objectIdRegex, "Invalid Category ID format"),
  
  tags: z.array(z.string()).optional(),
  
  publishDate: z
    .preprocess(
      (val) => (typeof val === "string" || val instanceof Date ? new Date(val) : val),
      z.date()
    )
    .optional(),
  
  status: z
    .preprocess(
      (val) => (typeof val === "string" ? val.toUpperCase().trim() : val),
      z.enum(["DRAFT", "PUBLISHED"])
    )
    .optional(),

  seoTitle: z.string().max(60, "SEO Title cannot exceed 60 characters").optional(),
  metaDescription: z.string().max(160, "Meta Description cannot exceed 160 characters").optional(),
  metaKeywords: z.preprocess(
    (val) => {
      if (Array.isArray(val)) return val;
      if (typeof val === "string" && val.trim()) return val.split(",").map((s: string) => s.trim()).filter(Boolean);
      return [];
    },
    z.array(z.string()).optional()
  ),
  canonicalUrl: z.string().optional(),

  ogTitle: z.string().max(100, "OG Title cannot exceed 100 characters").optional(),
  ogDescription: z.string().max(160, "OG Description cannot exceed 160 characters").optional(),
  ogImage: z.string().optional(),
  twitterCard: z.string().optional(),
  twitterTitle: z.string().max(100, "Twitter Title cannot exceed 100 characters").optional(),
  twitterDescription: z.string().max(160, "Twitter Description cannot exceed 160 characters").optional(),
  twitterImage: z.string().optional(),
  schemaMarkup: z.string().optional(),
  robotsIndex: z.preprocess((val) => val === "true" || val === true, z.boolean().optional()),
  robotsFollow: z.preprocess((val) => val === "true" || val === true, z.boolean().optional()),
  generateFaqSchema: z.preprocess((val) => val === "true" || val === true, z.boolean().optional()),
  generateBreadcrumbSchema: z.preprocess((val) => val === "true" || val === true, z.boolean().optional()),
});

export const createBlogSchema = blogBaseSchema.extend({
  featuredImage: z.string().optional().default(""),
  authorName: z.string().optional().default(""),
  tags: z.array(z.string()).optional().default([]),
  status: z
    .preprocess(
      (val) => (typeof val === "string" ? val.toUpperCase().trim() : val),
      z.enum(["DRAFT", "PUBLISHED"])
    )
    .optional()
    .default("DRAFT"),
  seoTitle: z.string().max(60, "SEO Title cannot exceed 60 characters").optional().default(""),
  metaDescription: z.string().max(160, "Meta Description cannot exceed 160 characters").optional().default(""),
  metaKeywords: z.preprocess(
    (val) => {
      if (Array.isArray(val)) return val;
      if (typeof val === "string" && val.trim()) return val.split(",").map((s: string) => s.trim()).filter(Boolean);
      return [];
    },
    z.array(z.string()).optional().default([])
  ),
  canonicalUrl: z.string().optional().default(""),
  ogTitle: z.string().max(100, "OG Title cannot exceed 100 characters").optional().default(""),
  ogDescription: z.string().max(160, "OG Description cannot exceed 160 characters").optional().default(""),
  ogImage: z.string().optional().default(""),
  twitterCard: z.string().optional().default("summary_large_image"),
  twitterTitle: z.string().max(100, "Twitter Title cannot exceed 100 characters").optional().default(""),
  twitterDescription: z.string().max(160, "Twitter Description cannot exceed 160 characters").optional().default(""),
  twitterImage: z.string().optional().default(""),
  schemaMarkup: z.string().optional().default(""),
  robotsIndex: z.boolean().optional().default(true),
  robotsFollow: z.boolean().optional().default(true),
  generateFaqSchema: z.boolean().optional().default(true),
  generateBreadcrumbSchema: z.boolean().optional().default(true),
});

export const updateBlogSchema = blogBaseSchema.partial();

export type CreateBlogInput = z.infer<typeof createBlogSchema>;
export type UpdateBlogInput = z.infer<typeof updateBlogSchema>;
