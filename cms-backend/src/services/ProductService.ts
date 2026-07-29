import mongoose from "mongoose";
import Product from "../models/Product";
import AuditLog from "../models/AuditLog";
import { connectDB } from "../lib/mongodb";
import { CreateProductDTO, UpdateProductDTO } from "../types/product.types";

export class ProductService {
  static async createProduct(
    data: CreateProductDTO,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    await connectDB();

    const existingProduct = await Product.findOne({ slug: data.slug });
    if (existingProduct) {
      throw new Error("Product with this slug already exists");
    }

    const product = await Product.create({
      ...data,
      createdBy: new mongoose.Types.ObjectId(userId),
    });

    await AuditLog.create({
      userId: new mongoose.Types.ObjectId(userId),
      action: "CREATE",
      entity: "PRODUCT",
      entityId: product._id,
      newData: product.toObject(),
      ipAddress,
      userAgent,
      status: "SUCCESS",
    });

    return product;
  }

  static async updateProduct(
    productId: string,
    data: UpdateProductDTO,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    await connectDB();

    const product = await Product.findById(productId);
    if (!product) {
      throw new Error("Product not found");
    }

    if (data.slug && data.slug !== product.slug) {
      const existingProduct = await Product.findOne({
        slug: data.slug,
        _id: { $ne: productId },
      });
      if (existingProduct) {
        throw new Error("Product with this slug already exists");
      }
    }

    const oldData = product.toObject();

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        ...data,
        updatedBy: new mongoose.Types.ObjectId(userId),
      },
      { new: true, runValidators: true }
    );

    await AuditLog.create({
      userId: new mongoose.Types.ObjectId(userId),
      action: "UPDATE",
      entity: "PRODUCT",
      entityId: product._id,
      oldData,
      newData: updatedProduct?.toObject(),
      ipAddress,
      userAgent,
      status: "SUCCESS",
    });

    return updatedProduct;
  }

  static async deleteProduct(
    productId: string,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    await connectDB();

    const product = await Product.findById(productId);
    if (!product) {
      throw new Error("Product not found");
    }

    const oldData = product.toObject();

    await Product.findByIdAndDelete(productId);

    await AuditLog.create({
      userId: new mongoose.Types.ObjectId(userId),
      action: "DELETE",
      entity: "PRODUCT",
      entityId: product._id,
      oldData,
      ipAddress,
      userAgent,
      status: "SUCCESS",
    });

    return true;
  }

  static async getAllProducts(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string
  ) {
    await connectDB();

    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort({ order: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("createdBy", "name email")
        .populate("updatedBy", "name email")
        .lean(),
      Product.countDocuments(query),
    ]);

    return {
      data: products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getProductById(productId: string) {
    await connectDB();
    const product = await Product.findById(productId).lean();
    if (!product) {
      throw new Error("Product not found");
    }
    return product;
  }

  static async getProductBySlug(slug: string) {
    await connectDB();
    const product = await Product.findOne({ slug, isActive: true }).lean();
    if (!product) {
      throw new Error("Product not found");
    }
    return product;
  }
}
