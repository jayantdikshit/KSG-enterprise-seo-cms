import mongoose from "mongoose";

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
