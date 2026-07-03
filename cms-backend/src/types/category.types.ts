export interface CreateCategoryDTO {
  name: string;
  slug: string;
  description?: string;
}

export interface UpdateCategoryDTO {
  name?: string;
  slug?: string;
  description?: string;
}

export interface CategoryDTO {
  _id: string;
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}
