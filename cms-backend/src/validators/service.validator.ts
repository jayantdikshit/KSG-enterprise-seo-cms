import { z } from "zod";

const faqItemSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
});

const serviceBaseSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(200),
  
  slug: z
    .preprocess(
      (val) => (typeof val === "string" ? val.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : val),
      z.string()
        .min(3, "Slug must be at least 3 characters")
        .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens")
    ),

  shortDescription: z.string().optional(),
  description: z.string().optional(),
  
  featuredImage: z.string().optional(),
  bannerImage: z.string().optional(),

  keyFeatures: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),

  faq: z.array(faqItemSchema).optional(),

  ctaTitle: z.string().optional(),
  ctaButtonText: z.string().optional(),
  ctaButtonUrl: z.string().optional(),

  status: z
    .preprocess(
      (val) => (typeof val === "string" ? val.toUpperCase().trim() : val),
      z.enum(["DRAFT", "PUBLISHED"])
    )
    .optional(),

  seoTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  metaKeywords: z
    .preprocess(
      (val) => {
        if (typeof val === "string") {
          return val.split(",").map((k) => k.trim()).filter(Boolean);
        }
        return val;
      },
      z.array(z.string())
    )
    .optional(),
  canonicalUrl: z.string().optional(),

  ogTitle: z.string().max(100).optional(),
  ogDescription: z.string().max(160).optional(),
  ogImage: z.string().optional(),

  schemaMarkup: z.string().optional(),
  generateFaqSchema: z.boolean().optional(),
  generateBreadcrumbSchema: z.boolean().optional(),
});

export const createServiceSchema = serviceBaseSchema.extend({
  shortDescription: z.string().optional().default(""),
  description: z.string().optional().default(""),
  featuredImage: z.string().optional().default(""),
  bannerImage: z.string().optional().default(""),
  keyFeatures: z.array(z.string()).optional().default([]),
  benefits: z.array(z.string()).optional().default([]),
  faq: z.array(faqItemSchema).optional().default([]),
  ctaTitle: z.string().optional().default(""),
  ctaButtonText: z.string().optional().default(""),
  ctaButtonUrl: z.string().optional().default(""),
  status: z
    .preprocess(
      (val) => (typeof val === "string" ? val.toUpperCase().trim() : val),
      z.enum(["DRAFT", "PUBLISHED"])
    )
    .optional()
    .default("DRAFT"),
  seoTitle: z.string().max(60).optional().default(""),
  metaDescription: z.string().max(160).optional().default(""),
  metaKeywords: z
    .preprocess(
      (val) => {
        if (typeof val === "string") {
          return val.split(",").map((k) => k.trim()).filter(Boolean);
        }
        return val;
      },
      z.array(z.string())
    )
    .optional()
    .default([]),
  canonicalUrl: z.string().optional().default(""),
  ogTitle: z.string().max(100).optional().default(""),
  ogDescription: z.string().max(160).optional().default(""),
  ogImage: z.string().optional().default(""),
  schemaMarkup: z.string().optional().default(""),
  generateFaqSchema: z.boolean().optional().default(true),
  generateBreadcrumbSchema: z.boolean().optional().default(true),
});

export const updateServiceSchema = serviceBaseSchema.partial();

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
