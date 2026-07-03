export interface MenuItem {
  _id?: string;
  label: string;
  type: "PAGE" | "SERVICE" | "BLOG_CATEGORY" | "CUSTOM" | "EXTERNAL";
  pageId?: string | null;
  serviceId?: string | null;
  blogCategoryId?: string | null;
  url?: string;
  target?: "_self" | "_blank";
  icon?: string;
  order?: number;
  parentId?: string | null;
  isActive?: boolean;
}

export interface CreateMenuDTO {
  name: string;
  location?: string | null;
  items?: MenuItem[];
}

export interface UpdateMenuDTO {
  name?: string;
  location?: string | null;
  items?: MenuItem[];
}

export interface MenuDTO {
  _id: string;
  name: string;
  location: string | null;
  items: MenuItem[];
  createdBy: any;
  updatedBy?: any;
  createdAt: string;
  updatedAt: string;
}
