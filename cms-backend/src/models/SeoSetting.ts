import mongoose from 'mongoose';

const SeoSettingSchema = new mongoose.Schema({
  siteName: { type: String, required: true, trim: true },
  defaultTitle: { type: String, default: '', trim: true },
  defaultDescription: { type: String, default: '', trim: true },
  defaultKeywords: { type: String, default: '', trim: true },
  defaultCanonicalUrl: { type: String, default: '', trim: true },
  defaultOgImage: { type: String, default: '', trim: true },
  googleAnalyticsCode: { type: String, default: '' },
  googleTagManagerCode: { type: String, default: '' },
  searchConsoleVerification: { type: String, default: '' },
  bingVerification: { type: String, default: '' },
  facebookVerification: { type: String, default: '' },
  twitterHandle: { type: String, default: '' },
}, { timestamps: true });

let SeoSettingModel: mongoose.Model<unknown>;
try {
  SeoSettingModel = mongoose.model('SeoSetting');
} catch (e) {
  SeoSettingModel = mongoose.model('SeoSetting', SeoSettingSchema);
}

export default SeoSettingModel;
