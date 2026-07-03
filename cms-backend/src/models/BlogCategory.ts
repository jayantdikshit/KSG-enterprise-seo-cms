import mongoose from "mongoose";

const BlogCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    isActive: {
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
  },
  { timestamps: true }
);

// Prevent re-compilation of models during Next.js dev hot reloads
let BlogCategoryModel: mongoose.Model<any>;
try {
  BlogCategoryModel = mongoose.model("BlogCategory");
} catch (e) {
  BlogCategoryModel = mongoose.model("BlogCategory", BlogCategorySchema);
}

export default BlogCategoryModel;
