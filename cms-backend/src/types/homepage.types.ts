export interface IHero {
  headline: string;
  subheadline: string;
  backgroundImage?: string;
  backgroundMobileImage?: string;
  primaryCTA?: {
    text: string;
    url: string;
  };
  secondaryCTA?: {
    text: string;
    url: string;
  };
  videoUrl?: string;
}

export interface IAbout {
  heading?: string;
  description?: string;
  image?: string;
  buttonText?: string;
  buttonUrl?: string;
}

export interface IServices {
  heading?: string;
  description?: string;
  selectedServices?: string[];
  showSection?: boolean;
}

export interface IWhyChooseUsCard {
  icon?: string;
  title?: string;
  description?: string;
  order?: number;
}

export interface IWhyChooseUs {
  heading?: string;
  subheading?: string;
  cards?: IWhyChooseUsCard[];
}

export interface ITestimonial {
  customerName?: string;
  designation?: string;
  company?: string;
  image?: string;
  rating?: number;
  review?: string;
  order?: number;
}

export interface IFAQ {
  question?: string;
  answer?: string;
  order?: number;
}

export interface IContactCTA {
  heading?: string;
  description?: string;
  buttonText?: string;
  buttonUrl?: string;
  backgroundImage?: string;
}

export interface IFooter {
  copyright?: string;
  address?: string;
  phone?: string;
  email?: string;
  socialLinks?: {
    facebook?: string;
    linkedin?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
}

export interface ISEO {
  title?: string;
  metaDescription?: string;
  metaKeywords?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  schemaMarkup?: string;
  robotsIndex?: boolean;
  robotsFollow?: boolean;
}

export interface IHomePage {
  _id?: string;
  hero: IHero;
  about?: IAbout;
  services?: IServices;
  whyChooseUs?: IWhyChooseUs;
  testimonials?: ITestimonial[];
  faq?: IFAQ[];
  contactCTA?: IContactCTA;
  footer?: IFooter;
  seo?: ISEO;
  status?: "DRAFT" | "PUBLISHED";
  createdAt?: string;
  updatedAt?: string;
}
