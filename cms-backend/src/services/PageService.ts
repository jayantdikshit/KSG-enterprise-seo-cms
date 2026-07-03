import mongoose from "mongoose";
import Page from "../models/Page";
import AuditLog from "../models/AuditLog";
import { connectDB } from "../lib/mongodb";
import { CreatePageDTO, UpdatePageDTO } from "../types/page.types";

export class PageService {
  static async createPage(
    data: CreatePageDTO,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    await connectDB();

    // Check if slug already exists
    const existingPage = await Page.findOne({ slug: data.slug });
    if (existingPage) {
      throw new Error("Page with this slug already exists");
    }

    const page = await Page.create({
      ...data,
      createdBy: new mongoose.Types.ObjectId(userId),
    });

    // Log audit
    await AuditLog.create({
      userId: new mongoose.Types.ObjectId(userId),
      action: "CREATE",
      entity: "PAGE",
      entityId: page._id,
      newData: page.toObject(),
      ipAddress,
      userAgent,
      status: "SUCCESS",
    });

    return page;
  }

  static async updatePage(
    pageId: string,
    data: UpdatePageDTO,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    await connectDB();

    const page = await Page.findById(pageId);
    if (!page) {
      throw new Error("Page not found");
    }

    // Check slug uniqueness if changing slug
    if (data.slug && data.slug !== page.slug) {
      const existingPage = await Page.findOne({ slug: data.slug });
      if (existingPage) {
        throw new Error("Page with this slug already exists");
      }
    }

    const oldData = page.toObject();
    const updatedPage = await Page.findByIdAndUpdate(
      pageId,
      {
        ...data,
        updatedBy: new mongoose.Types.ObjectId(userId),
      },
      { new: true }
    );

    // Log audit
    await AuditLog.create({
      userId: new mongoose.Types.ObjectId(userId),
      action: "UPDATE",
      entity: "PAGE",
      entityId: pageId,
      oldData,
      newData: updatedPage?.toObject(),
      ipAddress,
      userAgent,
      status: "SUCCESS",
    });

    return updatedPage;
  }

  static async deletePage(pageId: string, userId: string, ipAddress?: string, userAgent?: string) {
    await connectDB();

    const page = await Page.findById(pageId);
    if (!page) {
      throw new Error("Page not found");
    }

    const deletedPage = await Page.findByIdAndDelete(pageId);

    // Log audit
    await AuditLog.create({
      userId: new mongoose.Types.ObjectId(userId),
      action: "DELETE",
      entity: "PAGE",
      entityId: pageId,
      oldData: page.toObject(),
      ipAddress,
      userAgent,
      status: "SUCCESS",
    });

    return deletedPage;
  }

  static async getPageById(pageId: string) {
    await connectDB();

    const page = await Page.findById(pageId).populate("createdBy", "name email");

    if (!page) {
      throw new Error("Page not found");
    }

    return page;
  }

  static async getPageBySlug(slug: string) {
    await connectDB();

    const page = await Page.findOne({ slug, status: "PUBLISHED" });

    if (!page) {
      throw new Error("Page not found");
    }

    return page;
  }

  static async getAllPages(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string
  ) {
    await connectDB();

    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
      ];
    }

    if (status && ["DRAFT", "PUBLISHED"].includes(status)) {
      query.status = status;
    }

    const pages = await Page.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email");

    const total = await Page.countDocuments(query);

    return {
      data: pages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  static async publishPage(pageId: string, userId: string, ipAddress?: string, userAgent?: string) {
    await connectDB();

    const page = await Page.findById(pageId);
    if (!page) {
      throw new Error("Page not found");
    }

    const oldData = page.toObject();
    const updatedPage = await Page.findByIdAndUpdate(
      pageId,
      { status: "PUBLISHED", updatedBy: new mongoose.Types.ObjectId(userId) },
      { new: true }
    );

    // Log audit
    await AuditLog.create({
      userId: new mongoose.Types.ObjectId(userId),
      action: "PUBLISH",
      entity: "PAGE",
      entityId: pageId,
      oldData,
      newData: updatedPage?.toObject(),
      ipAddress,
      userAgent,
      status: "SUCCESS",
    });

    return updatedPage;
  }

  static async unpublishPage(
    pageId: string,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    await connectDB();

    const page = await Page.findById(pageId);
    if (!page) {
      throw new Error("Page not found");
    }

    const oldData = page.toObject();
    const updatedPage = await Page.findByIdAndUpdate(
      pageId,
      { status: "DRAFT", updatedBy: new mongoose.Types.ObjectId(userId) },
      { new: true }
    );

    // Log audit
    await AuditLog.create({
      userId: new mongoose.Types.ObjectId(userId),
      action: "UNPUBLISH",
      entity: "PAGE",
      entityId: pageId,
      oldData,
      newData: updatedPage?.toObject(),
      ipAddress,
      userAgent,
      status: "SUCCESS",
    });

    return updatedPage;
  }
}
