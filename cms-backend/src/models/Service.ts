import mongoose from "mongoose";

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

const ContactCTASchema = new mongoose.Schema({
  heading: { type: String, default: "", trim: true },
  description: { type: String, default: "", trim: true },
  buttonText: { type: String, default: "", trim: true },
  buttonUrl: { type: String, default: "", trim: true },
  backgroundImage: { type: String, default: "", trim: true },
});

const ServiceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    shortDescription: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      default: "",
    },

    featuredImage: {
      type: String,
      default: "",
    },

    bannerImage: {
      type: String,
      default: "",
    },

    keyFeatures: {
      type: [String],
      default: [],
    },

    benefits: {
      type: [String],
      default: [],
    },

    faq: {
      type: [
        {
          question: { type: String, required: true },
          answer: { type: String, required: true },
        },
      ],
      default: [],
    },

    // Old CTA fields (kept for backward compatibility if used)
    ctaTitle: {
      type: String,
      default: "",
    },
    ctaButtonText: {
      type: String,
      default: "",
    },
    ctaButtonUrl: {
      type: String,
      default: "",
    },

    // New Structured Fields
    whyChooseUs: { type: WhyChooseUsSchema, default: () => ({}) },
    testimonials: { type: [TestimonialSchema], default: [] },
    contactCTA: { type: ContactCTASchema, default: () => ({}) },

    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED"],
      default: "DRAFT",
    },

    seoTitle: {
      type: String,
      default: "",
    },

    metaDescription: {
      type: String,
      default: "",
    },

    metaKeywords: {
      type: [String],
      default: [],
    },

    canonicalUrl: {
      type: String,
      default: "",
    },

    ogTitle: {
      type: String,
      default: "",
    },

    ogDescription: {
      type: String,
      default: "",
    },

    ogImage: {
      type: String,
      default: "",
    },

    schemaMarkup: {
      type: String,
      default: "",
    },

    generateFaqSchema: {
      type: Boolean,
      default: true,
    },

    generateBreadcrumbSchema: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Prevent re-compilation of models during dev hot reloads
let ServiceModel: mongoose.Model<unknown>;
try {
  ServiceModel = mongoose.model("Service");
} catch (e) {
  ServiceModel = mongoose.model("Service", ServiceSchema);
}

export default ServiceModel;
