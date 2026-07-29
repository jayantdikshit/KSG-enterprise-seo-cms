export interface ProductSpecification {
  label: string;
  value: string;
}

export interface CreateProductDTO {
  name: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  featuredImage?: string;
  category?: string;
  keyFeatures?: string[];
  specifications?: ProductSpecification[];
  ctaButtonText?: string;
  ctaButtonUrl?: string;
  status?: "DRAFT" | "PUBLISHED";
  order?: number;
  seoTitle?: string;
  metaDescription?: string;
  ogImage?: string;
}

export interface UpdateProductDTO {
  name?: string;
  slug?: string;
  shortDescription?: string;
  description?: string;
  featuredImage?: string;
  category?: string;
  keyFeatures?: string[];
  specifications?: ProductSpecification[];
  ctaButtonText?: string;
  ctaButtonUrl?: string;
  status?: "DRAFT" | "PUBLISHED";
  order?: number;
  seoTitle?: string;
  metaDescription?: string;
  ogImage?: string;
}

export interface ProductDTO {
  _id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  featuredImage: string;
  category: string;
  keyFeatures: string[];
  specifications: ProductSpecification[];
  ctaButtonText: string;
  ctaButtonUrl: string;
  status: "DRAFT" | "PUBLISHED";
  order: number;
  seoTitle: string;
  metaDescription: string;
  ogImage: string;
  createdBy: string;
  updatedBy?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
