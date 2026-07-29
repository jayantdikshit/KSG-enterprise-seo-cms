import { z } from "zod";

const productSpecSchema = z.object({
  label: z.string().min(1, "Label is required"),
  value: z.string().min(1, "Value is required"),
});

const productBaseSchema = z.object({
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
  category: z.string().optional(),

  keyFeatures: z.array(z.string()).optional(),
  specifications: z.array(productSpecSchema).optional(),

  ctaButtonText: z.string().optional(),
  ctaButtonUrl: z.string().optional(),

  status: z
    .preprocess(
      (val) => (typeof val === "string" ? val.toUpperCase().trim() : val),
      z.enum(["DRAFT", "PUBLISHED"])
    )
    .optional(),

  order: z.number().int().optional(),

  seoTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  ogImage: z.string().optional(),
});

export const createProductSchema = productBaseSchema.extend({
  shortDescription: z.string().optional().default(""),
  description: z.string().optional().default(""),
  featuredImage: z.string().optional().default(""),
  category: z.string().optional().default(""),
  keyFeatures: z.array(z.string()).optional().default([]),
  specifications: z.array(productSpecSchema).optional().default([]),
  ctaButtonText: z.string().optional().default("Learn More"),
  ctaButtonUrl: z.string().optional().default(""),
  status: z
    .preprocess(
      (val) => (typeof val === "string" ? val.toUpperCase().trim() : val),
      z.enum(["DRAFT", "PUBLISHED"])
    )
    .optional()
    .default("DRAFT"),
  order: z.number().int().optional().default(0),
  seoTitle: z.string().max(60).optional().default(""),
  metaDescription: z.string().max(160).optional().default(""),
  ogImage: z.string().optional().default(""),
});

export const updateProductSchema = productBaseSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
