export interface CreateBlogDTO {
  title: string;
  slug: string;
  content: string;
  featuredImage?: string;
  authorName?: string;
  author?: string; // User ID
  category: string; // Category ID
  tags?: string[];
  publishDate?: Date | string;
  status?: "DRAFT" | "PUBLISHED";
  seoTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: string;
  schemaMarkup?: string;
}

export interface UpdateBlogDTO {
  title?: string;
  slug?: string;
  content?: string;
  featuredImage?: string;
  authorName?: string;
  author?: string;
  category?: string;
  tags?: string[];
  publishDate?: Date | string;
  status?: "DRAFT" | "PUBLISHED";
  seoTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: string;
  schemaMarkup?: string;
}

export interface BlogDTO {
  _id: string;
  title: string;
  slug: string;
  content: string;
  featuredImage: string;
  authorName: string;
  author?: any;
  category: any;
  tags: string[];
  publishDate: string;
  status: "DRAFT" | "PUBLISHED";
  seoTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterCard: string;
  schemaMarkup: string;
  createdBy: any;
  updatedBy?: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
