import mongoose from "mongoose";

const TeamMemberSchema = new mongoose.Schema({
  name: { type: String, required: [true, "Team member name is required"], trim: true },
  designation: { type: String, required: [true, "Team member designation is required"], trim: true },
  image: { type: String, default: "", trim: true },
  linkedin: { type: String, default: "", trim: true },
  twitter: { type: String, default: "", trim: true },
  email: { type: String, default: "", trim: true },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
});

const StatisticSchema = new mongoose.Schema({
  title: { type: String, required: [true, "Statistic title is required"], trim: true },
  value: { type: Number, required: [true, "Statistic value is required"] },
  suffix: { type: String, default: "", trim: true },
  icon: { type: String, default: "", trim: true },
  order: { type: Number, default: 0 },
});

const WhyChooseUsCardSchema = new mongoose.Schema({
  icon: { type: String, default: "", trim: true },
  title: { type: String, default: "", trim: true },
  description: { type: String, default: "", trim: true },
  order: { type: Number, default: 0 },
});

const WhyChooseUsSchema = new mongoose.Schema({
  heading: { type: String, default: "", trim: true },
  subheading: { type: String, default: "", trim: true },
  cards: { type: [WhyChooseUsCardSchema], default: [] },
});

const TestimonialSchema = new mongoose.Schema({
  customerName: { type: String, default: "", trim: true },
  designation: { type: String, default: "", trim: true },
  company: { type: String, default: "", trim: true },
  image: { type: String, default: "", trim: true },
  rating: { type: Number, default: 5, min: 1, max: 5 },
  review: { type: String, default: "", trim: true },
  order: { type: Number, default: 0 },
});

const FAQSchema = new mongoose.Schema({
  question: { type: String, default: "", trim: true },
  answer: { type: String, default: "", trim: true },
  order: { type: Number, default: 0 },
});

const ContactCTASchema = new mongoose.Schema({
  heading: { type: String, default: "", trim: true },
  description: { type: String, default: "", trim: true },
  buttonText: { type: String, default: "", trim: true },
  buttonUrl: { type: String, default: "", trim: true },
  backgroundImage: { type: String, default: "", trim: true },
});

const AboutSchema = new mongoose.Schema(
  {
    pageTitle: { type: String, default: "About", trim: true },
    pageTitleHighlight: { type: String, default: "Our Company", trim: true },
    pageSubtitle: { type: String, default: "Discover our mission, vision, and the core values that drive us to build a better future.", trim: true },
    companyOverview: { type: String, required: [true, "Company overview is required"], trim: true },
    mission: { type: String, required: [true, "Mission statement is required"], trim: true },
    vision: { type: String, required: [true, "Vision statement is required"], trim: true },
    teamMembers: { type: [TeamMemberSchema], default: [] },
    statistics: { type: [StatisticSchema], default: [] },
    images: { type: [String], default: [] },
    
    // New fields
    whyChooseUs: { type: WhyChooseUsSchema, default: () => ({}) },
    testimonials: { type: [TestimonialSchema], default: [] },
    faq: { type: [FAQSchema], default: [] },
    contactCTA: { type: ContactCTASchema, default: () => ({}) },

    seoTitle: { type: String, default: "", trim: true },
    metaDescription: { type: String, default: "", trim: true },
    metaKeywords: { type: String, default: "", trim: true },
    canonicalUrl: { type: String, default: "", trim: true },
    ogTitle: { type: String, default: "", trim: true },
    ogDescription: { type: String, default: "", trim: true },
    ogImage: { type: String, default: "", trim: true },
    twitterCard: { type: String, default: "summary_large_image", trim: true },
    schemaMarkup: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

// Prevent re-compilation of models during dev hot reloads, but force it if schema changes
if (mongoose.models.About) {
  delete mongoose.models.About;
}
const AboutModel = mongoose.model("About", AboutSchema);

export default AboutModel;
