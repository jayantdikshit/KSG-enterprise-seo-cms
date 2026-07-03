import mongoose from "mongoose";
import Media from "../models/Media";
import Folder from "../models/Folder";
import AuditLog from "../models/AuditLog";
import { connectDB } from "../lib/mongodb";
import { CreateMediaUploadDTO, UpdateMediaDTO } from "../types/media.types";
import {
  buildUploadFileName,
  convertImageBufferToWebp,
  deleteMediaFiles,
  getFileType,
  saveBufferToUpload,
} from "@/utils/storage";
import sharp from "sharp";
import path from "path";

export class MediaService {
  static async uploadImage(
    data: CreateMediaUploadDTO,
    buffer: Buffer,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    await connectDB();

    const normalizedFileName = buildUploadFileName(data.fileName);
    const mimeType = data.mimeType;
    const fileType = getFileType(mimeType);

    if (fileType !== "IMAGE") {
      throw new Error("Invalid file type. Only images are allowed on this endpoint.");
    }

    const existing = await Media.findOne({ fileName: normalizedFileName });
    if (existing) {
      throw new Error("Media file already exists");
    }

    // Get dimensions
    let width: number | undefined;
    let height: number | undefined;
    try {
      const dimensions = await sharp(buffer).metadata();
      width = dimensions.width;
      height = dimensions.height;
    } catch (e) {
      console.warn("Failed to read image dimensions:", e);
    }

    // Compress & Save original image
    const url = await saveBufferToUpload(buffer, normalizedFileName, "IMAGE");

    // Convert & Save to webp
    const webpFileName = `${normalizedFileName.replace(/\.[^.]+$/, "")}.webp`;
    const webpUrl = await convertImageBufferToWebp(buffer, webpFileName);

    const ext = path.extname(normalizedFileName).replace(".", "").toLowerCase();

    const media = await Media.create({
      originalName: data.originalName,
      fileName: normalizedFileName,
      mimeType,
      fileType,
      extension: ext,
      size: data.size,
      folder: data.folder || "uncategorized",
      alt: data.alt || "",
      altText: data.alt || "",
      title: data.title || "",
      caption: data.caption || "",
      description: data.description || "",
      width,
      height,
      url,
      webpUrl,
      uploadedBy: new mongoose.Types.ObjectId(userId),
      createdBy: new mongoose.Types.ObjectId(userId),
    });

    await AuditLog.create({
      userId: new mongoose.Types.ObjectId(userId),
      action: "CREATE",
      entity: "MEDIA",
      entityId: media._id,
      newData: media.toObject(),
      ipAddress,
      userAgent,
      status: "SUCCESS",
      meta: { event: "MEDIA_UPLOADED" },
    });

    return media;
  }

  static async uploadPDF(
    data: CreateMediaUploadDTO,
    buffer: Buffer,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    await connectDB();

    const normalizedFileName = buildUploadFileName(data.fileName);
    const mimeType = data.mimeType;
    const fileType = getFileType(mimeType);

    if (fileType !== "PDF") {
      throw new Error("Invalid file type. Only PDFs are allowed on this endpoint.");
    }

    const existing = await Media.findOne({ fileName: normalizedFileName });
    if (existing) {
      throw new Error("Media file already exists");
    }

    // Save PDF
    const url = await saveBufferToUpload(buffer, normalizedFileName, "PDF");

    const ext = "pdf";

    const media = await Media.create({
      originalName: data.originalName,
      fileName: normalizedFileName,
      mimeType,
      fileType,
      extension: ext,
      size: data.size,
      folder: data.folder || "uncategorized",
      alt: data.alt || "",
      altText: data.alt || "",
      title: data.title || "",
      caption: data.caption || "",
      description: data.description || "",
      url,
      uploadedBy: new mongoose.Types.ObjectId(userId),
      createdBy: new mongoose.Types.ObjectId(userId),
    });

    await AuditLog.create({
      userId: new mongoose.Types.ObjectId(userId),
      action: "CREATE",
      entity: "MEDIA",
      entityId: media._id,
      newData: media.toObject(),
      ipAddress,
      userAgent,
      status: "SUCCESS",
      meta: { event: "MEDIA_UPLOADED" },
    });

    return media;
  }

  static async getMediaById(mediaId: string) {
    await connectDB();
    const media = await Media.findById(mediaId).populate("uploadedBy createdBy", "name email");
    if (!media) {
      throw new Error("Media not found");
    }
    return media;
  }

  static async getAllMedia(page = 1, limit = 20, type?: string, folder?: string, search?: string) {
    await connectDB();
    const skip = (page - 1) * limit;

    const query: Record<string, any> = { isActive: true };

    if (type) {
      query.fileType = type.toUpperCase() === "IMAGE" ? "IMAGE" : type.toUpperCase() === "PDF" ? "PDF" : undefined;
      if (!query.fileType) delete query.fileType;
    }

    if (folder) {
      query.folder = folder;
    }

    if (search) {
      query.$or = [
        { originalName: { $regex: search, $options: "i" } },
        { alt: { $regex: search, $options: "i" } },
        { title: { $regex: search, $options: "i" } },
        { caption: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const data = await Media.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate("uploadedBy createdBy", "name email");

    const total = await Media.countDocuments(query);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  static async updateMediaMetadata(
    mediaId: string,
    data: UpdateMediaDTO,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    await connectDB();

    const media = await Media.findById(mediaId);
    if (!media) {
      throw new Error("Media not found");
    }

    const oldData = media.toObject();

    // Map altText from alt for backward compatibility
    const updatePayload: Record<string, any> = { ...data };
    if (data.alt !== undefined) {
      updatePayload.altText = data.alt;
    }

    const updated = await Media.findByIdAndUpdate(
      mediaId,
      {
        $set: updatePayload,
        updatedBy: new mongoose.Types.ObjectId(userId),
      },
      { new: true, runValidators: true }
    );

    await AuditLog.create({
      userId: new mongoose.Types.ObjectId(userId),
      action: "UPDATE",
      entity: "MEDIA",
      entityId: mediaId,
      oldData,
      newData: updated?.toObject(),
      ipAddress,
      userAgent,
      status: "SUCCESS",
      meta: { event: "MEDIA_UPDATED" },
    });

    return updated;
  }

  static async deleteMedia(mediaId: string, userId: string, ipAddress?: string, userAgent?: string) {
    await connectDB();

    const media = await Media.findById(mediaId);
    if (!media) {
      throw new Error("Media not found");
    }

    const deleted = await Media.findByIdAndDelete(mediaId);
    
    // Delete files from disk
    await deleteMediaFiles(media.fileName, media.fileType, media.webpUrl);

    await AuditLog.create({
      userId: new mongoose.Types.ObjectId(userId),
      action: "DELETE",
      entity: "MEDIA",
      entityId: mediaId,
      oldData: media.toObject(),
      ipAddress,
      userAgent,
      status: "SUCCESS",
      meta: { event: "MEDIA_DELETED" },
    });

    return deleted;
  }

  static async bulkDeleteMedia(ids: string[], userId: string, ipAddress?: string, userAgent?: string) {
    await connectDB();

    const deletedItems = [];

    for (const id of ids) {
      try {
        const item = await this.deleteMedia(id, userId, ipAddress, userAgent);
        deletedItems.push(item);
      } catch (e) {
        console.warn(`Failed to delete media with ID: ${id} in bulk delete:`, e);
      }
    }

    return deletedItems;
  }

  // Folder Operations
  static async createFolder(name: string, userId: string, ipAddress?: string, userAgent?: string) {
    await connectDB();

    const existing = await Folder.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, "i") } });
    if (existing) {
      throw new Error("Folder with this name already exists");
    }

    const folder = await Folder.create({
      name: name.trim(),
      createdBy: new mongoose.Types.ObjectId(userId),
    });

    await AuditLog.create({
      userId: new mongoose.Types.ObjectId(userId),
      action: "CREATE",
      entity: "MEDIA",
      entityId: folder._id,
      newData: folder.toObject(),
      ipAddress,
      userAgent,
      status: "SUCCESS",
      meta: { event: "FOLDER_CREATED" },
    });

    return folder;
  }

  static async listFolders() {
    await connectDB();
    return await Folder.find().sort({ name: 1 }).populate("createdBy", "name email");
  }

  static async renameFolder(folderId: string, newName: string, userId: string, ipAddress?: string, userAgent?: string) {
    await connectDB();

    const folder = await Folder.findById(folderId);
    if (!folder) {
      throw new Error("Folder not found");
    }

    const oldName = folder.name;
    const trimmedNewName = newName.trim();

    if (oldName.toLowerCase() === trimmedNewName.toLowerCase()) {
      return folder;
    }

    const existing = await Folder.findOne({ name: { $regex: new RegExp(`^${trimmedNewName}$`, "i") } });
    if (existing) {
      throw new Error("Another folder with this name already exists");
    }

    const oldData = folder.toObject();
    folder.name = trimmedNewName;
    const updatedFolder = await folder.save();

    // Bulk update the folder string in all related Media items
    await Media.updateMany({ folder: oldName }, { folder: trimmedNewName });

    await AuditLog.create({
      userId: new mongoose.Types.ObjectId(userId),
      action: "UPDATE",
      entity: "MEDIA",
      entityId: folderId,
      oldData,
      newData: updatedFolder.toObject(),
      ipAddress,
      userAgent,
      status: "SUCCESS",
      meta: { event: "FOLDER_RENAMED", oldName, newName: trimmedNewName },
    });

    return updatedFolder;
  }

  static async deleteFolder(folderId: string, userId: string, ipAddress?: string, userAgent?: string) {
    await connectDB();

    const folder = await Folder.findById(folderId);
    if (!folder) {
      throw new Error("Folder not found");
    }

    // Refuse delete if folder contains active files
    const fileCount = await Media.countDocuments({ folder: folder.name, isActive: true });
    if (fileCount > 0) {
      throw new Error("Cannot delete folder because it is not empty. Please move or delete the files first.");
    }

    const deletedFolder = await Folder.findByIdAndDelete(folderId);

    await AuditLog.create({
      userId: new mongoose.Types.ObjectId(userId),
      action: "DELETE",
      entity: "MEDIA",
      entityId: folderId,
      oldData: folder.toObject(),
      ipAddress,
      userAgent,
      status: "SUCCESS",
      meta: { event: "FOLDER_DELETED" },
    });

    return deletedFolder;
  }

  static async moveFiles(ids: string[], targetFolder: string, userId: string, ipAddress?: string, userAgent?: string) {
    await connectDB();

    // Verify folder exists or is "uncategorized"
    if (targetFolder !== "uncategorized") {
      const folderExists = await Folder.findOne({ name: { $regex: new RegExp(`^${targetFolder.trim()}$`, "i") } });
      if (!folderExists) {
        throw new Error(`Target folder '${targetFolder}' does not exist. Please create it first.`);
      }
    }

    const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));

    // Get old data for audit logs
    const oldMediaItems = await Media.find({ _id: { $in: objectIds } });

    // Update
    await Media.updateMany(
      { _id: { $in: objectIds } },
      { $set: { folder: targetFolder.trim(), updatedBy: new mongoose.Types.ObjectId(userId) } }
    );

    const updatedMediaItems = await Media.find({ _id: { $in: objectIds } });

    await AuditLog.create({
      userId: new mongoose.Types.ObjectId(userId),
      action: "UPDATE",
      entity: "MEDIA",
      entityId: new mongoose.Types.ObjectId("000000000000000000000000"), // Dummy ID
      oldData: { fileIds: ids, oldFolders: oldMediaItems.map((m) => m.folder) },
      newData: { fileIds: ids, newFolder: targetFolder },
      ipAddress,
      userAgent,
      status: "SUCCESS",
      meta: { event: "MEDIA_MOVED", count: ids.length },
    });

    return updatedMediaItems;
  }
}

export default MediaService;
