import mongoose from "mongoose";
import HomePage from "../models/HomePage";
import AuditLog from "../models/AuditLog";
import { connectDB } from "../lib/mongodb";
import { CreateHomePageInput, UpdateHomePageInput } from "../validators/homepage.validator";
// Register Service model schema to prevent MissingSchemaError during populate
import "../models/Service";

export class HomePageService {
  static async getHomePage(previewMode: boolean = false) {
    await connectDB();
    
    const homepage = await HomePage.findOne()
      .populate({
        path: "services.selectedServices",
        select: "name slug shortDescription description featuredImage isActive",
      });

    if (!homepage) {
      throw new Error("Homepage not found");
    }

    if (!previewMode && homepage.status !== "PUBLISHED") {
      throw new Error("Homepage not found");
    }

    return homepage;
  }

  static async createHomePage(
    data: CreateHomePageInput,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    await connectDB();

    // Enforce Singleton: Only one homepage configuration is allowed
    const count = await HomePage.countDocuments();
    if (count > 0) {
      throw new Error("A homepage configuration already exists. Use PUT to update.");
    }

    // Validate selected services references
    if (data.services?.selectedServices && data.services.selectedServices.length > 0) {
      const serviceIds = data.services.selectedServices;
      const uniqueIds = [...new Set(serviceIds)];
      
      const ServiceModel = mongoose.model("Service");
      const serviceCount = await ServiceModel.countDocuments({
        _id: { $in: uniqueIds.map((id) => new mongoose.Types.ObjectId(id)) },
      });

      if (serviceCount !== uniqueIds.length) {
        throw new Error("One or more selected Service IDs do not exist in the database");
      }
    }

    const homepage = await HomePage.create(data);

    await AuditLog.create({
      userId: new mongoose.Types.ObjectId(userId),
      action: "CREATE",
      entity: "PAGE",
      entityId: homepage._id,
      newData: homepage.toObject(),
      ipAddress,
      userAgent,
      status: "SUCCESS",
      meta: { event: "HOMEPAGE_CREATED" },
    });

    return homepage;
  }

  static async updateHomePage(
    data: UpdateHomePageInput,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    await connectDB();

    const homepage = await HomePage.findOne();
    if (!homepage) {
      throw new Error("Homepage not found");
    }

    // Validate selected services references if passed
    if (data.services?.selectedServices && data.services.selectedServices.length > 0) {
      const serviceIds = data.services.selectedServices;
      const uniqueIds = [...new Set(serviceIds)];
      
      const ServiceModel = mongoose.model("Service");
      const serviceCount = await ServiceModel.countDocuments({
        _id: { $in: uniqueIds.map((id) => new mongoose.Types.ObjectId(id)) },
      });

      if (serviceCount !== uniqueIds.length) {
        throw new Error("One or more selected Service IDs do not exist in the database");
      }
    }

    const oldData = homepage.toObject();

    // Perform update
    const updated = await HomePage.findByIdAndUpdate(
      homepage._id,
      { $set: data },
      { new: true, runValidators: true }
    );

    await AuditLog.create({
      userId: new mongoose.Types.ObjectId(userId),
      action: "UPDATE",
      entity: "PAGE",
      entityId: homepage._id,
      oldData,
      newData: updated?.toObject(),
      ipAddress,
      userAgent,
      status: "SUCCESS",
      meta: { event: "HOMEPAGE_UPDATED" },
    });

    return updated;
  }

  static async publishHomePage(
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    await connectDB();

    const homepage = await HomePage.findOne();
    if (!homepage) {
      throw new Error("Homepage not found");
    }

    if (homepage.status === "PUBLISHED") {
      return homepage;
    }

    const oldData = homepage.toObject();
    homepage.status = "PUBLISHED";
    const updated = await homepage.save();

    await AuditLog.create({
      userId: new mongoose.Types.ObjectId(userId),
      action: "UPDATE",
      entity: "PAGE",
      entityId: homepage._id,
      oldData,
      newData: updated.toObject(),
      ipAddress,
      userAgent,
      status: "SUCCESS",
      meta: { event: "HOMEPAGE_PUBLISHED" },
    });

    return updated;
  }

  static async unpublishHomePage(
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    await connectDB();

    const homepage = await HomePage.findOne();
    if (!homepage) {
      throw new Error("Homepage not found");
    }

    if (homepage.status === "DRAFT") {
      return homepage;
    }

    const oldData = homepage.toObject();
    homepage.status = "DRAFT";
    const updated = await homepage.save();

    await AuditLog.create({
      userId: new mongoose.Types.ObjectId(userId),
      action: "UPDATE",
      entity: "PAGE",
      entityId: homepage._id,
      oldData,
      newData: updated.toObject(),
      ipAddress,
      userAgent,
      status: "SUCCESS",
      meta: { event: "HOMEPAGE_UNPUBLISHED" },
    });

    return updated;
  }
}

export default HomePageService;
