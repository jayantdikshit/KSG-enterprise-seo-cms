import Page from "../models/Page";
import { connectDB } from "../lib/mongodb";

export class PageRepository {
  static async findById(id: string) {
    await connectDB();
    return Page.findById(id).populate("createdBy updatedBy", "name email");
  }

  static async findBySlug(slug: string) {
    await connectDB();
    return Page.findOne({ slug }).populate("createdBy updatedBy", "name email");
  }

  static async findAll(query: Record<string, unknown> = {}, skip = 0, limit = 10) {
    await connectDB();
    return Page.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate("createdBy updatedBy", "name email");
  }

  static async countByQuery(query: Record<string, unknown> = {}) {
    await connectDB();
    return Page.countDocuments(query);
  }

  static async create(data: Record<string, unknown>) {
    await connectDB();
    return Page.create(data);
  }

  static async updateById(id: string, data: Record<string, unknown>) {
    await connectDB();
    return Page.findByIdAndUpdate(id, data, { new: true });
  }

  static async deleteById(id: string) {
    await connectDB();
    return Page.findByIdAndDelete(id);
  }

  static async findPublished(skip = 0, limit = 10) {
    await connectDB();
    return Page.find({ status: "PUBLISHED" })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate("createdBy updatedBy", "name email");
  }

  static async countPublished() {
    await connectDB();
    return Page.countDocuments({ status: "PUBLISHED" });
  }

  static async searchPages(searchTerm: string, skip = 0, limit = 10) {
    await connectDB();
    return Page.find({
      $or: [
        { title: { $regex: searchTerm, $options: "i" } },
        { slug: { $regex: searchTerm, $options: "i" } },
      ],
    })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate("createdBy updatedBy", "name email");
  }
}
