import mongoose from "mongoose";
import BlogCategory from "../models/BlogCategory";
import Blog from "../models/Blog";
import AuditLog from "../models/AuditLog";
import { connectDB } from "../lib/mongodb";
import { CreateCategoryDTO, UpdateCategoryDTO } from "../types/category.types";

export class CategoryService {
  static async createCategory(
    data: CreateCategoryDTO,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    await connectDB();

    const nameLower = data.name.trim().toLowerCase();
    const existingByName = await BlogCategory.findOne({
      name: { $regex: new RegExp(`^${nameLower}$`, "i") },
    });
    if (existingByName) {
      throw new Error("Category with this name already exists");
    }

    const existingBySlug = await BlogCategory.findOne({ slug: data.slug });
    if (existingBySlug) {
      throw new Error("Category with this slug already exists");
    }

    const category = await BlogCategory.create({
      ...data,
      createdBy: new mongoose.Types.ObjectId(userId),
    });

    await AuditLog.create({
      userId: new mongoose.Types.ObjectId(userId),
      action: "CREATE",
      entity: "BLOG_CATEGORY",
      entityId: category._id,
      newData: category.toObject(),
      ipAddress,
      userAgent,
      status: "SUCCESS",
    });

    return category;
  }

  static async updateCategory(
    categoryId: string,
    data: UpdateCategoryDTO,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    await connectDB();

    const category = await BlogCategory.findById(categoryId);
    if (!category) {
      throw new Error("Category not found");
    }

    if (data.name) {
      const nameLower = data.name.trim().toLowerCase();
      const existingByName = await BlogCategory.findOne({
        name: { $regex: new RegExp(`^${nameLower}$`, "i") },
        _id: { $ne: categoryId },
      });
      if (existingByName) {
        throw new Error("Category with this name already exists");
      }
    }

    if (data.slug && data.slug !== category.slug) {
      const existingBySlug = await BlogCategory.findOne({
        slug: data.slug,
        _id: { $ne: categoryId },
      });
      if (existingBySlug) {
        throw new Error("Category with this slug already exists");
      }
    }

    const oldData = category.toObject();
    const updatedCategory = await BlogCategory.findByIdAndUpdate(
      categoryId,
      {
        ...data,
        updatedBy: new mongoose.Types.ObjectId(userId),
      },
      { new: true }
    );

    await AuditLog.create({
      userId: new mongoose.Types.ObjectId(userId),
      action: "UPDATE",
      entity: "BLOG_CATEGORY",
      entityId: categoryId,
      oldData,
      newData: updatedCategory?.toObject(),
      ipAddress,
      userAgent,
      status: "SUCCESS",
    });

    return updatedCategory;
  }

  static async deleteCategory(
    categoryId: string,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    await connectDB();

    const category = await BlogCategory.findById(categoryId);
    if (!category) {
      throw new Error("Category not found");
    }

    // Check if any active blog uses this category
    const associatedBlogs = await Blog.findOne({ category: categoryId, isActive: true });
    if (associatedBlogs) {
      throw new Error("Cannot delete category because it has active blog posts associated with it");
    }

    // Physical deletion
    const deletedCategory = await BlogCategory.findByIdAndDelete(categoryId);

    await AuditLog.create({
      userId: new mongoose.Types.ObjectId(userId),
      action: "DELETE",
      entity: "BLOG_CATEGORY",
      entityId: categoryId,
      oldData: category.toObject(),
      ipAddress,
      userAgent,
      status: "SUCCESS",
    });

    return deletedCategory;
  }

  static async getAllCategories() {
    await connectDB();
    return await BlogCategory.find({ isActive: true })
      .sort({ name: 1 })
      .populate("createdBy updatedBy", "name email");
  }

  static async getCategoryById(categoryId: string) {
    await connectDB();
    const category = await BlogCategory.findById(categoryId).populate("createdBy updatedBy", "name email");
    if (!category) {
      throw new Error("Category not found");
    }
    return category;
  }
}

export default CategoryService;
