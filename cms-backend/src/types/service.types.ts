import { IWhyChooseUs, ITestimonial, IContactCTA } from './homepage.types';

export interface FaqItem {
  question: string;
  answer: string;
}

export interface CreateServiceDTO {
  name: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  featuredImage?: string;
  bannerImage?: string;
  keyFeatures?: string[];
  benefits?: string[];
  faq?: FaqItem[];
  ctaTitle?: string;
  ctaButtonText?: string;
  ctaButtonUrl?: string;
  whyChooseUs?: IWhyChooseUs;
  testimonials?: ITestimonial[];
  contactCTA?: IContactCTA;
  status?: "DRAFT" | "PUBLISHED";
  seoTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  schemaMarkup?: string;
  generateFaqSchema?: boolean;
  generateBreadcrumbSchema?: boolean;
}

export interface UpdateServiceDTO {
  name?: string;
  slug?: string;
  shortDescription?: string;
  description?: string;
  featuredImage?: string;
  bannerImage?: string;
  keyFeatures?: string[];
  benefits?: string[];
  faq?: FaqItem[];
  ctaTitle?: string;
  ctaButtonText?: string;
  ctaButtonUrl?: string;
  whyChooseUs?: IWhyChooseUs;
  testimonials?: ITestimonial[];
  contactCTA?: IContactCTA;
  status?: "DRAFT" | "PUBLISHED";
  seoTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  schemaMarkup?: string;
  generateFaqSchema?: boolean;
  generateBreadcrumbSchema?: boolean;
}

export interface ServiceDTO {
  _id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  featuredImage?: string;
  bannerImage?: string;
  keyFeatures: string[];
  benefits: string[];
  faq: FaqItem[];
  ctaTitle: string;
  ctaButtonText: string;
  ctaButtonUrl: string;
  whyChooseUs?: IWhyChooseUs;
  testimonials?: ITestimonial[];
  contactCTA?: IContactCTA;
  status: "DRAFT" | "PUBLISHED";
  seoTitle?: string;
  metaDescription?: string;
  metaKeywords: string[];
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  schemaMarkup?: string;
  generateFaqSchema: boolean;
  generateBreadcrumbSchema: boolean;
  createdBy: string;
  updatedBy?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
