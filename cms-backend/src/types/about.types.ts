export interface ITeamMember {
  _id?: string;
  name: string;
  designation: string;
  image?: string;
  linkedin?: string;
  twitter?: string;
  email?: string;
  order?: number;
  isActive?: boolean;
}

export interface IStatistic {
  _id?: string;
  title: string;
  value: number;
  suffix?: string;
  icon?: string;
  order?: number;
}

export interface IAbout {
  _id?: string;
  companyOverview: string;
  mission: string;
  vision: string;
  teamMembers?: ITeamMember[];
  statistics?: IStatistic[];
  images?: string[];
  seoTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: string;
  schemaMarkup?: string;
  createdAt?: string;
  updatedAt?: string;
}
