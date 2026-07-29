export interface SeoSettingDTO {
  _id?: string;
  siteName: string;
  logoUrl?: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultKeywords: string;
  defaultCanonicalUrl: string;
  defaultOgImage: string;
  googleAnalyticsCode: string;
  googleTagManagerCode: string;
  searchConsoleVerification: string;
  bingVerification: string;
  facebookVerification: string;
  twitterHandle: string;
  createdAt?: string;
  updatedAt?: string;
}
