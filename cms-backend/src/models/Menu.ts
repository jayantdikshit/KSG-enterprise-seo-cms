import mongoose from "mongoose";

const MenuItemSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["PAGE", "SERVICE", "BLOG_CATEGORY", "CUSTOM", "EXTERNAL"],
  },
  pageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Page",
    default: null,
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
    default: null,
  },
  blogCategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BlogCategory",
    default: null,
  },
  url: {
    type: String,
    default: "",
    trim: true,
  },
  target: {
    type: String,
    enum: ["_self", "_blank"],
    default: "_self",
  },
  icon: {
    type: String,
    default: "",
    trim: true,
  },
  order: {
    type: Number,
    default: 0,
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

const MenuSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      default: null,
      sparse: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    items: {
      type: [MenuItemSchema],
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
      default: null,
    },
  },
  { timestamps: true }
);

// Prevent re-compilation of models during dev hot reloads
let MenuModel: mongoose.Model<unknown>;
try {
  MenuModel = mongoose.model("Menu");
} catch (e) {
  MenuModel = mongoose.model("Menu", MenuSchema);
}

export default MenuModel;
