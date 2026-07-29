import { IWhyChooseUs, ITestimonial, IFAQ, IContactCTA } from './homepage.types';

export interface PageSection {
  id: string;
  type: string;
  properties?: any;
  order: number;
}

export interface CreatePageDTO {
  title: string;
  slug: string;
  content?: string;
  whyChooseUs?: IWhyChooseUs;
  testimonials?: ITestimonial[];
  faq?: IFAQ[];
  contactCTA?: IContactCTA;
  status?: "DRAFT" | "PUBLISHED";
  seoTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  canonicalUrl?: string;
  robotsIndex?: boolean;
  robotsFollow?: boolean;
  schemaMarkup?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  sections?: PageSection[];
}

export interface UpdatePageDTO {
  title?: string;
  slug?: string;
  content?: string;
  whyChooseUs?: IWhyChooseUs;
  testimonials?: ITestimonial[];
  faq?: IFAQ[];
  contactCTA?: IContactCTA;
  status?: "DRAFT" | "PUBLISHED";
  seoTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  canonicalUrl?: string;
  robotsIndex?: boolean;
  robotsFollow?: boolean;
  schemaMarkup?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  sections?: PageSection[];
}

export interface PageDTO {
  _id: string;
  title: string;
  slug: string;
  content: string;
  whyChooseUs?: IWhyChooseUs;
  testimonials?: ITestimonial[];
  faq?: IFAQ[];
  contactCTA?: IContactCTA;
  status: "DRAFT" | "PUBLISHED";
  seoTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  canonicalUrl?: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
  schemaMarkup?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  sections: PageSection[];
  createdBy: string;
  updatedBy?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
