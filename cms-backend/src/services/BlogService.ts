import mongoose from "mongoose";
import Blog from "../models/Blog";
import BlogCategory from "../models/BlogCategory";
import AuditLog from "../models/AuditLog";
import { connectDB } from "../lib/mongodb";
import { CreateBlogDTO, UpdateBlogDTO } from "../types/blog.types";

export class BlogService {
  static async createBlog(
    data: CreateBlogDTO,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    await connectDB();

    // Check slug uniqueness
    const existingBlog = await Blog.findOne({ slug: data.slug });
    if (existingBlog) {
      throw new Error("Blog with this slug already exists");
    }

    // Verify Category exists
    const categoryDoc = await BlogCategory.findById(data.category);
    if (!categoryDoc) {
      throw new Error("Specified Category not found");
    }

    // Create Blog post
    const blog = await Blog.create({
      ...data,
      createdBy: new mongoose.Types.ObjectId(userId),
      author: data.author ? new mongoose.Types.ObjectId(data.author) : new mongoose.Types.ObjectId(userId),
    });

    await AuditLog.create({
      userId: new mongoose.Types.ObjectId(userId),
      action: "CREATE",
      entity: "BLOG",
      entityId: blog._id,
      newData: blog.toObject(),
      ipAddress,
      userAgent,
      status: "SUCCESS",
    });

    return blog;
  }

  static async updateBlog(
    blogId: string,
    data: UpdateBlogDTO,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    await connectDB();

    const blog = await Blog.findById(blogId);
    if (!blog) {
      throw new Error("Blog not found");
    }

    // Check slug uniqueness if updated
    if (data.slug && data.slug !== blog.slug) {
      const existingBlog = await Blog.findOne({ slug: data.slug });
      if (existingBlog) {
        throw new Error("Blog with this slug already exists");
      }
    }

    // Check Category if updated
    if (data.category) {
      const categoryDoc = await BlogCategory.findById(data.category);
      if (!categoryDoc) {
        throw new Error("Specified Category not found");
      }
    }

    const oldData = blog.toObject();

    // Prepare update payload
    const updatePayload: any = { ...data, updatedBy: new mongoose.Types.ObjectId(userId) };
    if (data.author) {
      updatePayload.author = new mongoose.Types.ObjectId(data.author);
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      blogId,
      updatePayload,
      { new: true }
    );

    await AuditLog.create({
      userId: new mongoose.Types.ObjectId(userId),
      action: "UPDATE",
      entity: "BLOG",
      entityId: blogId,
      oldData,
      newData: updatedBlog?.toObject(),
      ipAddress,
      userAgent,
      status: "SUCCESS",
    });

    return updatedBlog;
  }

  static async deleteBlog(
    blogId: string,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    await connectDB();

    const blog = await Blog.findById(blogId);
    if (!blog) {
      throw new Error("Blog not found");
    }

    const deletedBlog = await Blog.findByIdAndDelete(blogId);

    await AuditLog.create({
      userId: new mongoose.Types.ObjectId(userId),
      action: "DELETE",
      entity: "BLOG",
      entityId: blogId,
      oldData: blog.toObject(),
      ipAddress,
      userAgent,
      status: "SUCCESS",
    });

    return deletedBlog;
  }

  static async getAllBlogs(options: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    category?: string; // category slug or category ID
    tag?: string;
    sort?: string;
    previewMode?: boolean;
  }) {
    await connectDB();

    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;
    const sortStr = options.sort || "-publishDate";

    const query: Record<string, any> = { isActive: true };

    // Apply Search filter (title, content, tags)
    if (options.search) {
      query.$or = [
        { title: { $regex: options.search, $options: "i" } },
        { content: { $regex: options.search, $options: "i" } },
        { tags: { $regex: options.search, $options: "i" } },
      ];
    }

    // Apply Preview/Public filters
    if (!options.previewMode) {
      // Public users strictly view only published posts that are past their publish date
      query.status = "PUBLISHED";
      query.publishDate = { $lte: new Date() };
    } else {
      // Admins/Editors can filter by DRAFT or PUBLISHED
      if (options.status && ["DRAFT", "PUBLISHED"].includes(options.status)) {
        query.status = options.status;
      }
    }

    // Apply Category filter (Can be Category ID or Category Slug)
    if (options.category) {
      if (mongoose.Types.ObjectId.isValid(options.category)) {
        query.category = options.category;
      } else {
        // Find category by slug first
        const categoryDoc = await BlogCategory.findOne({ slug: options.category, isActive: true });
        if (categoryDoc) {
          query.category = categoryDoc._id;
        } else {
          // If category not found, return empty set
          return {
            data: [],
            pagination: { page, limit, total: 0, pages: 0 },
          };
        }
      }
    }

    // Apply Tag filter
    if (options.tag) {
      query.tags = { $in: [options.tag] };
    }

    const blogs = await Blog.find(query)
      .skip(skip)
      .limit(limit)
      .sort(sortStr)
      .populate("category", "name slug")
      .populate("author createdBy updatedBy", "name email");

    const total = await Blog.countDocuments(query);

    return {
      data: blogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  static async getBlogById(blogId: string, previewMode: boolean = false) {
    await connectDB();

    const blog = await Blog.findById(blogId)
      .populate("category", "name slug")
      .populate("author createdBy updatedBy", "name email");

    if (!blog) {
      throw new Error("Blog not found");
    }

    // Enforce publication check for public view
    if (!previewMode) {
      if (blog.status !== "PUBLISHED" || blog.publishDate > new Date() || !blog.isActive) {
        throw new Error("Blog not found");
      }
    }

    return blog;
  }

  static async getBlogBySlug(slug: string, previewMode: boolean = false) {
    await connectDB();

    const blog = await Blog.findOne({ slug, isActive: true })
      .populate("category", "name slug")
      .populate("author createdBy updatedBy", "name email");

    if (!blog) {
      throw new Error("Blog not found");
    }

    // Enforce publication check for public view
    if (!previewMode) {
      if (blog.status !== "PUBLISHED" || blog.publishDate > new Date()) {
        throw new Error("Blog not found");
      }
    }

    // Fetch related blogs (up to 5)
    // Criteria: same category, active, published, excluding current blog
    const relatedBlogs = await Blog.find({
      category: blog.category._id,
      _id: { $ne: blog._id },
      status: "PUBLISHED",
      publishDate: { $lte: new Date() },
      isActive: true,
    })
      .limit(5)
      .sort("-publishDate")
      .populate("category", "name slug")
      .populate("author", "name email");

    return {
      blog,
      relatedBlogs,
    };
  }

  static async publishBlog(
    blogId: string,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    await connectDB();

    const blog = await Blog.findById(blogId);
    if (!blog) {
      throw new Error("Blog not found");
    }

    const oldData = blog.toObject();

    // If publishing, ensure publishDate is updated if it was scheduled for future or not set
    const updateFields: any = {
      status: "PUBLISHED",
      updatedBy: new mongoose.Types.ObjectId(userId),
    };
    if (blog.publishDate > new Date()) {
      updateFields.publishDate = new Date();
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      blogId,
      updateFields,
      { new: true }
    );

    await AuditLog.create({
      userId: new mongoose.Types.ObjectId(userId),
      action: "PUBLISH",
      entity: "BLOG",
      entityId: blogId,
      oldData,
      newData: updatedBlog?.toObject(),
      ipAddress,
      userAgent,
      status: "SUCCESS",
      meta: { event: "BLOG_PUBLISHED" },
    });

    return updatedBlog;
  }

  static async unpublishBlog(
    blogId: string,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    await connectDB();

    const blog = await Blog.findById(blogId);
    if (!blog) {
      throw new Error("Blog not found");
    }

    const oldData = blog.toObject();
    const updatedBlog = await Blog.findByIdAndUpdate(
      blogId,
      { status: "DRAFT", updatedBy: new mongoose.Types.ObjectId(userId) },
      { new: true }
    );

    await AuditLog.create({
      userId: new mongoose.Types.ObjectId(userId),
      action: "UNPUBLISH",
      entity: "BLOG",
      entityId: blogId,
      oldData,
      newData: updatedBlog?.toObject(),
      ipAddress,
      userAgent,
      status: "SUCCESS",
      meta: { event: "BLOG_UNPUBLISHED" },
    });

    return updatedBlog;
  }

  // Automatic Background Cron API Support
  // Scans for all DRAFT blogs whose scheduled publishDate is now in the past and automatically publishes them
  static async publishScheduledBlogs(ipAddress?: string, userAgent?: string) {
    await connectDB();

    const scheduledBlogs = await Blog.find({
      status: "DRAFT",
      publishDate: { $lte: new Date() },
      isActive: true,
    });

    const results = [];
    for (const blog of scheduledBlogs) {
      const oldData = blog.toObject();
      const updated = await Blog.findByIdAndUpdate(
        blog._id,
        { status: "PUBLISHED" },
        { new: true }
      );

      await AuditLog.create({
        userId: blog.createdBy, // Attribute to creator
        action: "PUBLISH",
        entity: "BLOG",
        entityId: blog._id,
        oldData,
        newData: updated?.toObject(),
        ipAddress,
        userAgent,
        status: "SUCCESS",
        meta: { event: "BLOG_AUTO_PUBLISHED" },
      });

      results.push(blog._id);
    }

    return results;
  }
}

export default BlogService;
