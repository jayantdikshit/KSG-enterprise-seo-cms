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

const PageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    content: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED"],
      default: "DRAFT",
    },
    
    // New Structured Fields
    whyChooseUs: { type: WhyChooseUsSchema, default: () => ({}) },
    testimonials: { type: [TestimonialSchema], default: [] },
    faq: { type: [FAQSchema], default: [] },
    contactCTA: { type: ContactCTASchema, default: () => ({}) },

    seoTitle: {
      type: String,
    },

    metaDescription: {
      type: String,
    },

    metaKeywords: {
      type: String,
    },

    canonicalUrl: {
      type: String,
    },

    robotsIndex: {
      type: Boolean,
      default: true,
    },

    robotsFollow: {
      type: Boolean,
      default: true,
    },

    schemaMarkup: {
      type: String,
    },

    ogTitle: {
      type: String,
    },

    ogDescription: {
      type: String,
    },

    ogImage: {
      type: String,
    },

    twitterCard: {
      type: String,
    },

    twitterTitle: {
      type: String,
    },

    twitterDescription: {
      type: String,
    },

    twitterImage: {
      type: String,
    },

    sections: {
      type: [
        {
          id: {
            type: String,
            required: true,
          },
          type: {
            type: String,
            required: true,
          },
          properties: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
          },
          order: {
            type: Number,
            required: true,
          },
        },
      ],
      default: [],
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

let PageModel: mongoose.Model<unknown>;
try {
  PageModel = mongoose.model("Page");
} catch (e) {
  PageModel = mongoose.model("Page", PageSchema);
}

export default PageModel;
