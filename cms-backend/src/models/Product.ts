import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
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

    category: {
      type: String,
      default: "",
    },

    keyFeatures: {
      type: [String],
      default: [],
    },

    specifications: {
      type: [
        {
          label: { type: String, required: true },
          value: { type: String, required: true },
        },
      ],
      default: [],
    },

    ctaButtonText: {
      type: String,
      default: "Learn More",
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

    order: {
      type: Number,
      default: 0,
    },

    seoTitle: {
      type: String,
      default: "",
    },

    metaDescription: {
      type: String,
      default: "",
    },

    ogImage: {
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

// Prevent re-compilation of models during dev hot reloads
let ProductModel: mongoose.Model<unknown>;
try {
  ProductModel = mongoose.model("Product");
} catch (e) {
  ProductModel = mongoose.model("Product", ProductSchema);
}

export default ProductModel;
