import mongoose from "mongoose";

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
