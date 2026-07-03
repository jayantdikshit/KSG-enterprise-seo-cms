import { z } from "zod";

const sectionSchema = z.object({
  id: z.string().min(1, "Section ID is required"),
  type: z.string().min(1, "Section type is required"),
  properties: z.record(z.string(), z.any()).optional().default({}),
  order: z.number().int().nonnegative("Order must be a non-negative integer"),
});

const pageBaseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  slug: z
    .preprocess((val) => (typeof val === "string" ? (val as string).toLowerCase().trim() : val),
      z.string()
        .min(3, "Slug must be at least 3 characters")
        .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens")
    ),
  content: z.string().optional(),
  status: z.preprocess(
    (val) => (typeof val === "string" ? (val as string).toUpperCase().trim() : val),
    z.enum(["DRAFT", "PUBLISHED"])
  ).optional(),
  seoTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  metaKeywords: z.string().optional(),
  canonicalUrl: z.string().optional(),
  robotsIndex: z.boolean().optional(),
  robotsFollow: z.boolean().optional(),
  schemaMarkup: z.string().optional(),
  ogTitle: z.string().max(100).optional(),
  ogDescription: z.string().max(160).optional(),
  ogImage: z.string().optional(),
  twitterCard: z.string().optional(),
  twitterTitle: z.string().optional(),
  twitterDescription: z.string().optional(),
  twitterImage: z.string().optional(),
  sections: z.array(sectionSchema).optional(),
});

export const createPageSchema = pageBaseSchema.extend({
  content: z.string().optional().default(""),
  status: z.preprocess(
    (val) => (typeof val === "string" ? (val as string).toUpperCase().trim() : val),
    z.enum(["DRAFT", "PUBLISHED"])
  ).optional().default("DRAFT"),
  robotsIndex: z.boolean().optional().default(true),
  robotsFollow: z.boolean().optional().default(true),
  sections: z.array(sectionSchema).optional().default([]),
});

export const updatePageSchema = pageBaseSchema.partial();

export type CreatePageInput = z.infer<typeof createPageSchema>;
export type UpdatePageInput = z.infer<typeof updatePageSchema>;
