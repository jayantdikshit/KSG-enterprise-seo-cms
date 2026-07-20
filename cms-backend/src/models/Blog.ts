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
    twitterTitle: {
      type: String,
      default: "",
    },
    twitterDescription: {
      type: String,
      default: "",
    },
    twitterImage: {
      type: String,
      default: "",
    },
    schemaMarkup: {
      type: String,
      default: "",
    },
    robotsIndex: {
      type: Boolean,
      default: true,
    },
    robotsFollow: {
      type: Boolean,
      default: true,
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

// Prevent re-compilation of models during Next.js dev hot reloads
interface BlogDocument extends mongoose.Document {
  title: string;
  slug?: string;
  featuredImage?: string;
  publishDate?: Date;
  updatedAt?: Date;
  authorName?: string;
  author?: any;
  category?: any;
  metaDescription?: string;
  schemaMarkup?: string;
}
let BlogModel: mongoose.Model<mongoose.Document>;
if (mongoose.models.Blog) {
  BlogModel = mongoose.model('Blog');
} else {
  BlogModel = mongoose.model('Blog', BlogSchema);
}

export default BlogModel;
