import mongoose from "mongoose";
import Service from "../models/Service";
import AuditLog from "../models/AuditLog";
import { connectDB } from "../lib/mongodb";
import { CreateServiceDTO, UpdateServiceDTO } from "../types/service.types";

export class ServiceService {
  static async createService(
    data: CreateServiceDTO,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    await connectDB();

    const existingService = await Service.findOne({ slug: data.slug });
    if (existingService) {
      throw new Error("Service with this slug already exists");
    }

    const service = await Service.create({
      ...data,
      createdBy: new mongoose.Types.ObjectId(userId),
    });

    await AuditLog.create({
      userId: new mongoose.Types.ObjectId(userId),
      action: "CREATE",
      entity: "SERVICE",
      entityId: service._id,
      newData: service.toObject(),
      ipAddress,
      userAgent,
      status: "SUCCESS",
    });

    return service;
  }

  static async updateService(
    serviceId: string,
    data: UpdateServiceDTO,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    await connectDB();

    const service = await Service.findById(serviceId);
    if (!service) {
      throw new Error("Service not found");
    }

    if (data.slug && data.slug !== service.slug) {
      const existingService = await Service.findOne({ slug: data.slug });
      if (existingService) {
        throw new Error("Service with this slug already exists");
      }
    }

    const oldData = service.toObject();
    const updatedService = await Service.findByIdAndUpdate(
      serviceId,
      {
        ...data,
        updatedBy: new mongoose.Types.ObjectId(userId),
      },
      { new: true }
    );

    await AuditLog.create({
      userId: new mongoose.Types.ObjectId(userId),
      action: "UPDATE",
      entity: "SERVICE",
      entityId: serviceId,
      oldData,
      newData: updatedService?.toObject(),
      ipAddress,
      userAgent,
      status: "SUCCESS",
    });

    return updatedService;
  }

  static async deleteService(
    serviceId: string,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    await connectDB();

    const service = await Service.findById(serviceId);
    if (!service) {
      throw new Error("Service not found");
    }

    const deletedService = await Service.findByIdAndDelete(serviceId);

    await AuditLog.create({
      userId: new mongoose.Types.ObjectId(userId),
      action: "DELETE",
      entity: "SERVICE",
      entityId: serviceId,
      oldData: service.toObject(),
      ipAddress,
      userAgent,
      status: "SUCCESS",
    });

    return deletedService;
  }

  static async getAllServices(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string
  ) {
    await connectDB();

    const skip = (page - 1) * limit;
    const query: Record<string, unknown> = { isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { shortDescription: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (status && ["DRAFT", "PUBLISHED"].includes(status)) {
      query.status = status;
    }

    const services = await Service.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate("createdBy updatedBy", "name email");

    const total = await Service.countDocuments(query);

    return {
      data: services,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  static async getServiceById(serviceId: string) {
    await connectDB();

    const service = await Service.findById(serviceId).populate("createdBy updatedBy", "name email");
    if (!service) {
      throw new Error("Service not found");
    }

    return service;
  }

  static async getServiceBySlug(slug: string) {
    await connectDB();

    const service = await Service.findOne({ slug, status: "PUBLISHED", isActive: true })
      .populate("createdBy updatedBy", "name email");
      
    if (!service) {
      throw new Error("Service not found");
    }

    return service;
  }

  static async publishService(
    serviceId: string,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    await connectDB();

    const service = await Service.findById(serviceId);
    if (!service) {
      throw new Error("Service not found");
    }

    const oldData = service.toObject();
    const updatedService = await Service.findByIdAndUpdate(
      serviceId,
      { status: "PUBLISHED", updatedBy: new mongoose.Types.ObjectId(userId) },
      { new: true }
    );

    await AuditLog.create({
      userId: new mongoose.Types.ObjectId(userId),
      action: "PUBLISH",
      entity: "SERVICE",
      entityId: serviceId,
      oldData,
      newData: updatedService?.toObject(),
      ipAddress,
      userAgent,
      status: "SUCCESS",
      meta: { event: "SERVICE_PUBLISHED" },
    });

    return updatedService;
  }

  static async unpublishService(
    serviceId: string,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    await connectDB();

    const service = await Service.findById(serviceId);
    if (!service) {
      throw new Error("Service not found");
    }

    const oldData = service.toObject();
    const updatedService = await Service.findByIdAndUpdate(
      serviceId,
      { status: "DRAFT", updatedBy: new mongoose.Types.ObjectId(userId) },
      { new: true }
    );

    await AuditLog.create({
      userId: new mongoose.Types.ObjectId(userId),
      action: "UNPUBLISH",
      entity: "SERVICE",
      entityId: serviceId,
      oldData,
      newData: updatedService?.toObject(),
      ipAddress,
      userAgent,
      status: "SUCCESS",
      meta: { event: "SERVICE_UNPUBLISHED" },
    });

    return updatedService;
  }
}
export default ServiceService;
