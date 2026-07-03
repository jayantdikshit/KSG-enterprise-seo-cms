import mongoose from "mongoose";

const BlogSchema = new mongoose.Schema(
  {
    title: {
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
    content: {
      type: String,
      required: true,
    },
    featuredImage: {
      type: String,
      default: "",
    },
    authorName: {
      type: String,
      default: "",
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BlogCategory",
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    publishDate: {
      type: Date,
      default: Date.now,
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
    twitterCard: {
      type: String,
      default: "summary_large_image",
    },
    schemaMarkup: {
      type: String,
      default: "",
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

// Prevent re-compilation of models during Next.js dev hot reloads
let BlogModel: mongoose.Model<any>;
try {
  BlogModel = mongoose.model("Blog");
} catch (e) {
  BlogModel = mongoose.model("Blog", BlogSchema);
}

export default BlogModel;
