import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

// Preprocessors
const heroPreprocessor = (val: any) => {
  if (val && typeof val === "object") {
    const copy = { ...val };
    if (copy.subHeadline !== undefined && copy.subheadline === undefined) {
      copy.subheadline = copy.subHeadline;
    }
    if (copy.videoURL !== undefined && copy.videoUrl === undefined) {
      copy.videoUrl = copy.videoURL;
    }
    return copy;
  }
  return val;
};

const seoPreprocessor = (val: any) => {
  if (val && typeof val === "object") {
    const copy = { ...val };
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

// Base Schemas (No defaults)
const heroBaseSchema = z.preprocess(
  heroPreprocessor,
  z.object({
    headline: z.string().min(3, "Hero headline must be at least 3 characters").max(200),
    subheadline: z.string().min(3, "Hero subheadline must be at least 3 characters").max(500),
    backgroundImage: z.string().optional(),
    backgroundMobileImage: z.string().optional(),
    primaryCTA: z
      .object({
        text: z.string().optional(),
        url: z.string().optional(),
      })
      .optional(),
    secondaryCTA: z
      .object({
        text: z.string().optional(),
        url: z.string().optional(),
      })
      .optional(),
    videoUrl: z.string().optional(),
  })
);

const aboutBaseSchema = z.object({
  heading: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  buttonText: z.string().optional(),
  buttonUrl: z.string().optional(),
});

const servicesBaseSchema = z.object({
  heading: z.string().optional(),
  description: z.string().optional(),
  selectedServices: z
    .array(z.string().regex(objectIdRegex, "Invalid Service ID format"))
    .optional(),
  showSection: z.boolean().optional(),
});

export const whyChooseUsCardBaseSchema = z.object({
  icon: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  order: z.coerce.number().int().optional(),
});

export const whyChooseUsBaseSchema = z.object({
  heading: z.string().optional(),
  subheading: z.string().optional(),
  cards: z.array(whyChooseUsCardBaseSchema).optional(),
});

export const testimonialBaseSchema = z.object({
  customerName: z.string().optional(),
  designation: z.string().optional(),
  company: z.string().optional(),
  image: z.string().optional(),
  rating: z.coerce.number().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5").optional(),
  review: z.string().optional(),
  order: z.coerce.number().int().optional(),
});

export const faqBaseSchema = z.object({
  question: z.string().min(1, "FAQ question cannot be empty"),
  answer: z.string().optional(),
  order: z.coerce.number().int().optional(),
});

export const contactCTABaseSchema = z.object({
  heading: z.string().optional(),
  description: z.string().optional(),
  buttonText: z.string().optional(),
  buttonUrl: z.string().optional(),
  backgroundImage: z.string().optional(),
});

const footerBaseSchema = z.object({
  copyright: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  socialLinks: z
    .object({
      facebook: z.string().optional(),
      linkedin: z.string().optional(),
      instagram: z.string().optional(),
      twitter: z.string().optional(),
      youtube: z.string().optional(),
    })
    .optional(),
});

const seoBaseSchema = z.preprocess(
  seoPreprocessor,
  z.object({
    title: z.string().optional(),
    metaDescription: z.string().optional(),
    metaKeywords: z.string().optional(),
    canonicalUrl: z.string().optional(),
    ogTitle: z.string().optional(),
    ogDescription: z.string().optional(),
    ogImage: z.string().optional(),
    twitterCard: z.enum(["summary", "summary_large_image"]).optional(),
    twitterTitle: z.string().optional(),
    twitterDescription: z.string().optional(),
    twitterImage: z.string().optional(),
    schemaMarkup: z.string().optional(),
    robotsIndex: z.boolean().optional(),
    robotsFollow: z.boolean().optional(),
  })
);

// HomePage Base Schema (No defaults)
const homePageBaseSchema = z.object({
  hero: heroBaseSchema,
  about: aboutBaseSchema.optional(),
  services: servicesBaseSchema.optional(),
  whyChooseUs: whyChooseUsBaseSchema.optional(),
  testimonials: z.array(testimonialBaseSchema).optional(),
  faq: z.array(faqBaseSchema).optional(),
  contactCTA: contactCTABaseSchema.optional(),
  footer: footerBaseSchema.optional(),
  seo: seoBaseSchema.optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
});

// HomePage Create Schema (With defaults)
const heroCreateSchema = z.preprocess(
  heroPreprocessor,
  z.object({
    headline: z.string().min(3, "Hero headline must be at least 3 characters").max(200),
    subheadline: z.string().min(3, "Hero subheadline must be at least 3 characters").max(500),
    backgroundImage: z.string().optional().default(""),
    backgroundMobileImage: z.string().optional().default(""),
    primaryCTA: z
      .object({
        text: z.string().optional().default(""),
        url: z.string().optional().default(""),
      })
      .optional()
      .default(() => ({ text: "", url: "" })),
    secondaryCTA: z
      .object({
        text: z.string().optional().default(""),
        url: z.string().optional().default(""),
      })
      .optional()
      .default(() => ({ text: "", url: "" })),
    videoUrl: z.string().optional().default(""),
  })
);

const aboutCreateSchema = z
  .object({
    heading: z.string().optional().default(""),
    description: z.string().optional().default(""),
    image: z.string().optional().default(""),
    buttonText: z.string().optional().default(""),
    buttonUrl: z.string().optional().default(""),
  })
  .optional()
  .default(() => ({ heading: "", description: "", image: "", buttonText: "", buttonUrl: "" }));

const servicesCreateSchema = z
  .object({
    heading: z.string().optional().default(""),
    description: z.string().optional().default(""),
    selectedServices: z
      .array(z.string().regex(objectIdRegex, "Invalid Service ID format"))
      .optional()
      .default([]),
    showSection: z.boolean().optional().default(true),
  })
  .optional()
  .default(() => ({ heading: "", description: "", selectedServices: [], showSection: true }));

const whyChooseUsCardCreateSchema = z.object({
  icon: z.string().optional().default(""),
  title: z.string().optional().default(""),
  description: z.string().optional().default(""),
  order: z.coerce.number().int().optional().default(0),
});

const whyChooseUsCreateSchema = z
  .object({
    heading: z.string().optional().default(""),
    subheading: z.string().optional().default(""),
    cards: z.array(whyChooseUsCardCreateSchema).optional().default([]),
  })
  .optional()
  .default(() => ({ heading: "", subheading: "", cards: [] }));

const testimonialCreateSchema = z.object({
  customerName: z.string().optional().default(""),
  designation: z.string().optional().default(""),
  company: z.string().optional().default(""),
  image: z.string().optional().default(""),
  rating: z.coerce.number().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5").optional().default(5),
  review: z.string().optional().default(""),
  order: z.coerce.number().int().optional().default(0),
});

const faqCreateSchema = z.object({
  question: z.string().min(1, "FAQ question cannot be empty"),
  answer: z.string().optional().default(""),
  order: z.coerce.number().int().optional().default(0),
});

const contactCTACreateSchema = z
  .object({
    heading: z.string().optional().default(""),
    description: z.string().optional().default(""),
    buttonText: z.string().optional().default(""),
    buttonUrl: z.string().optional().default(""),
    backgroundImage: z.string().optional().default(""),
  })
  .optional()
  .default(() => ({ heading: "", description: "", buttonText: "", buttonUrl: "", backgroundImage: "" }));

const footerCreateSchema = z
  .object({
    copyright: z.string().optional().default(""),
    address: z.string().optional().default(""),
    phone: z.string().optional().default(""),
    email: z.string().optional().default(""),
    socialLinks: z
      .object({
        facebook: z.string().optional().default(""),
        linkedin: z.string().optional().default(""),
        instagram: z.string().optional().default(""),
        twitter: z.string().optional().default(""),
        youtube: z.string().optional().default(""),
      })
      .optional()
      .default(() => ({ facebook: "", linkedin: "", instagram: "", twitter: "", youtube: "" })),
  })
  .optional()
  .default(() => ({ copyright: "", address: "", phone: "", email: "", socialLinks: { facebook: "", linkedin: "", instagram: "", twitter: "", youtube: "" } }));

const seoCreateSchema = z.preprocess(
  seoPreprocessor,
  z.object({
    title: z.string().optional().default(""),
    metaDescription: z.string().optional().default(""),
    metaKeywords: z.string().optional().default(""),
    canonicalUrl: z.string().optional().default(""),
    ogTitle: z.string().optional().default(""),
    ogDescription: z.string().optional().default(""),
    ogImage: z.string().optional().default(""),
    twitterCard: z.enum(["summary", "summary_large_image"]).optional().default("summary_large_image"),
    twitterTitle: z.string().optional().default(""),
    twitterDescription: z.string().optional().default(""),
    twitterImage: z.string().optional().default(""),
    schemaMarkup: z.string().optional().default(""),
    robotsIndex: z.boolean().optional().default(true),
    robotsFollow: z.boolean().optional().default(true),
  })
)
  .optional()
  .default(() => ({
    title: "",
    metaDescription: "",
    metaKeywords: "",
    canonicalUrl: "",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    twitterCard: "summary_large_image" as const,
    twitterTitle: "",
    twitterDescription: "",
    twitterImage: "",
    schemaMarkup: "",
    robotsIndex: true,
    robotsFollow: true,
  }));

export const createHomePageSchema = z.object({
  hero: heroCreateSchema,
  about: aboutCreateSchema,
  services: servicesCreateSchema,
  whyChooseUs: whyChooseUsCreateSchema,
  testimonials: z.array(testimonialCreateSchema).optional().default([]),
  faq: z.array(faqCreateSchema).optional().default([]),
  contactCTA: contactCTACreateSchema,
  footer: footerCreateSchema,
  seo: seoCreateSchema,
  status: z.enum(["DRAFT", "PUBLISHED"]).optional().default("DRAFT"),
});

export const updateHomePageSchema = homePageBaseSchema.partial();

export type CreateHomePageInput = z.infer<typeof createHomePageSchema>;
export type UpdateHomePageInput = z.infer<typeof updateHomePageSchema>;
