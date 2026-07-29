import { z } from "zod";
import { whyChooseUsBaseSchema, testimonialBaseSchema, faqBaseSchema, contactCTABaseSchema } from "./homepage.validator";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const teamMemberSchema = z.object({
  _id: z.string().regex(objectIdRegex).optional(),
  name: z.string().min(1, "Name is required").max(100),
  designation: z.string().min(1, "Designation is required").max(100),
  image: z.string().optional().default(""),
  linkedin: z
    .preprocess((val) => (val === "" || val === undefined ? "" : val), z.string())
    .optional()
    .default(""),
  twitter: z
    .preprocess((val) => (val === "" || val === undefined ? "" : val), z.string())
    .optional()
    .default(""),
  email: z
    .preprocess((val) => (val === "" || val === undefined ? "" : val), z.string())
    .optional()
    .default(""),
  order: z.number().int().optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export const statisticSchema = z.object({
  _id: z.string().regex(objectIdRegex).optional(),
  title: z.string().min(1, "Statistic title is required").max(100),
  value: z.number("Statistic value must be a number"),
  suffix: z.string().optional().default(""),
  icon: z.string().optional().default(""),
  order: z.number().int().optional().default(0),
});

const aboutBaseSchema = z.object({
  pageTitle: z.string().optional(),
  pageTitleHighlight: z.string().optional(),
  pageSubtitle: z.string().optional(),
  companyOverview: z.string().min(3, "Company overview must be at least 3 characters"),
  mission: z.string().min(3, "Mission statement must be at least 3 characters"),
  vision: z.string().min(3, "Vision statement must be at least 3 characters"),
  teamMembers: z.array(teamMemberSchema).optional(),
  statistics: z.array(statisticSchema).optional(),
  images: z.array(z.string()).optional(),
  
  whyChooseUs: whyChooseUsBaseSchema.optional(),
  testimonials: z.array(testimonialBaseSchema).optional(),
  faq: z.array(faqBaseSchema).optional(),
  contactCTA: contactCTABaseSchema.optional(),
  
  // SEO fields
  seoTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  canonicalUrl: z.string().optional(),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImage: z.string().optional(),
  twitterCard: z.enum(["summary", "summary_large_image"]).optional(),
  schemaMarkup: z.string().optional(),
});

const aboutCreateSchema = aboutBaseSchema.extend({
  pageTitle: z.string().optional().default("About"),
  pageTitleHighlight: z.string().optional().default("Our Company"),
  pageSubtitle: z.string().optional().default("Discover our mission, vision, and the core values that drive us to build a better future."),
  teamMembers: z.array(teamMemberSchema).optional().default([]),
  statistics: z.array(statisticSchema).optional().default([]),
  images: z.array(z.string()).optional().default([]),
  
  // SEO fields
  seoTitle: z.string().optional().default(""),
  metaDescription: z.string().optional().default(""),
  metaKeywords: z.string().optional().default(""),
  canonicalUrl: z.string().optional().default(""),
  ogTitle: z.string().optional().default(""),
  ogDescription: z.string().optional().default(""),
  ogImage: z.string().optional().default(""),
  twitterCard: z.enum(["summary", "summary_large_image"]).optional().default("summary_large_image"),
  schemaMarkup: z.string().optional().default(""),
});

const normalizeAboutKeys = (val: unknown) => {
  if (val && typeof val === "object") {
    const copy: any = { ...val };
    if (copy.canonicalURL !== undefined && copy.canonicalUrl === undefined) {
      copy.canonicalUrl = copy.canonicalURL;
    }
    if (copy.metaKeywords !== undefined) {
      if (Array.isArray(copy.metaKeywords)) {
        copy.metaKeywords = copy.metaKeywords.join(", ");
      }
    }
    return copy;
  }
  return val;
};

export const createAboutSchema = z.preprocess(normalizeAboutKeys, aboutCreateSchema);
export const updateAboutSchema = z.preprocess(normalizeAboutKeys, aboutBaseSchema.partial());

export type CreateAboutInput = z.infer<typeof createAboutSchema>;
export type UpdateAboutInput = z.infer<typeof updateAboutSchema>;
