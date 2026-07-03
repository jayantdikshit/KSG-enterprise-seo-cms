import mongoose from "mongoose";

const HeroSchema = new mongoose.Schema({
  headline: {
    type: String,
    required: [true, "Hero headline is required"],
    trim: true,
  },
  subheadline: {
    type: String,
    required: [true, "Hero subheadline is required"],
    trim: true,
  },
  backgroundImage: {
    type: String,
    default: "",
    trim: true,
  },
  backgroundMobileImage: {
    type: String,
    default: "",
    trim: true,
  },
  primaryCTA: {
    text: { type: String, default: "", trim: true },
    url: { type: String, default: "", trim: true },
  },
  secondaryCTA: {
    text: { type: String, default: "", trim: true },
    url: { type: String, default: "", trim: true },
  },
  videoUrl: {
    type: String,
    default: "",
    trim: true,
  },
});

const AboutSchema = new mongoose.Schema({
  heading: { type: String, default: "", trim: true },
  description: { type: String, default: "", trim: true },
  image: { type: String, default: "", trim: true },
  buttonText: { type: String, default: "", trim: true },
  buttonUrl: { type: String, default: "", trim: true },
});

const ServicesSchema = new mongoose.Schema({
  heading: { type: String, default: "", trim: true },
  description: { type: String, default: "", trim: true },
  selectedServices: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Service" }],
    default: [],
  },
  showSection: { type: Boolean, default: true },
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

const FooterSchema = new mongoose.Schema({
  copyright: { type: String, default: "", trim: true },
  address: { type: String, default: "", trim: true },
  phone: { type: String, default: "", trim: true },
  email: { type: String, default: "", trim: true },
  socialLinks: {
    facebook: { type: String, default: "", trim: true },
    linkedin: { type: String, default: "", trim: true },
    instagram: { type: String, default: "", trim: true },
    twitter: { type: String, default: "", trim: true },
    youtube: { type: String, default: "", trim: true },
  },
});

const SEOSchema = new mongoose.Schema({
  title: { type: String, default: "", trim: true },
  metaDescription: { type: String, default: "", trim: true },
  metaKeywords: { type: String, default: "", trim: true },
  canonicalUrl: { type: String, default: "", trim: true },
  ogTitle: { type: String, default: "", trim: true },
  ogDescription: { type: String, default: "", trim: true },
  ogImage: { type: String, default: "", trim: true },
  twitterCard: { type: String, default: "summary_large_image", trim: true },
  twitterTitle: { type: String, default: "", trim: true },
  twitterDescription: { type: String, default: "", trim: true },
  twitterImage: { type: String, default: "", trim: true },
  schemaMarkup: { type: String, default: "", trim: true },
  robotsIndex: { type: Boolean, default: true },
  robotsFollow: { type: Boolean, default: true },
});

const HomePageSchema = new mongoose.Schema(
  {
    hero: {
      type: HeroSchema,
      required: true,
    },
    about: {
      type: AboutSchema,
      default: () => ({}),
    },
    services: {
      type: ServicesSchema,
      default: () => ({}),
    },
    whyChooseUs: {
      type: WhyChooseUsSchema,
      default: () => ({}),
    },
    testimonials: {
      type: [TestimonialSchema],
      default: [],
    },
    faq: {
      type: [FAQSchema],
      default: [],
    },
    contactCTA: {
      type: ContactCTASchema,
      default: () => ({}),
    },
    footer: {
      type: FooterSchema,
      default: () => ({}),
    },
    seo: {
      type: SEOSchema,
      default: () => ({}),
    },
    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED"],
      default: "DRAFT",
    },
  },
  { timestamps: true }
);

// Prevent re-compilation of models during dev hot reloads
let HomePageModel: mongoose.Model<any>;
try {
  HomePageModel = mongoose.model("HomePage");
} catch (e) {
  HomePageModel = mongoose.model("HomePage", HomePageSchema);
}

export default HomePageModel;
