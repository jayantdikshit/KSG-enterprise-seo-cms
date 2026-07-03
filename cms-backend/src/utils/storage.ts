import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";

const baseUploadRoot = path.join(process.cwd(), "public", "uploads");
const imagesDir = path.join(baseUploadRoot, "images");
const pdfsDir = path.join(baseUploadRoot, "pdfs");
const webpDir = path.join(baseUploadRoot, "webp");

const extensionMimeMap: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".bmp": "image/bmp",
  ".tiff": "image/tiff",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
};

export async function ensureUploadDirectories() {
  await fs.mkdir(baseUploadRoot, { recursive: true });
  await fs.mkdir(imagesDir, { recursive: true });
  await fs.mkdir(pdfsDir, { recursive: true });
  await fs.mkdir(webpDir, { recursive: true });
}

export function sanitizeFileName(name: string) {
  const baseName = path.basename(name);
  const ext = path.extname(baseName);
  const nameWithoutExt = path.parse(baseName).name;
  const cleaned = nameWithoutExt
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .replace(/\.{2,}/g, ".");

  return `${cleaned || Date.now()}${ext.toLowerCase()}`;
}

export function buildUploadFileName(originalName: string) {
  const sanitized = sanitizeFileName(originalName);
  return `${uuidv4()}-${sanitized}`;
}

export function getMimeType(file: { type?: string; name: string }) {
  if (file.type) {
    return file.type;
  }
  const extension = path.extname(file.name).toLowerCase();
  return extensionMimeMap[extension] || "application/octet-stream";
}

export function getFileType(mimeType: string) {
  if (mimeType.startsWith("image/")) {
    return "IMAGE" as const;
  }
  if (mimeType === "application/pdf") {
    return "PDF" as const;
  }
  throw new Error("Unsupported file type. Only standard image formats and PDF uploads are allowed.");
}

// Compress and save original file to subfolders
export async function saveBufferToUpload(buffer: Buffer, fileName: string, fileType: "IMAGE" | "PDF") {
  await ensureUploadDirectories();
  
  if (fileType === "IMAGE") {
    const targetPath = path.join(imagesDir, fileName);
    let processedBuffer = buffer;

    // Apply sharp compression based on file format
    try {
      const ext = path.extname(fileName).toLowerCase();
      if (ext === ".jpg" || ext === ".jpeg") {
        processedBuffer = await sharp(buffer).jpeg({ quality: 80 }).toBuffer();
      } else if (ext === ".png") {
        processedBuffer = await sharp(buffer).png({ compressionLevel: 8 }).toBuffer();
      } else if (ext === ".webp") {
        processedBuffer = await sharp(buffer).webp({ quality: 80 }).toBuffer();
      }
    } catch (e) {
      console.warn("Failed to apply sharp compression, saving raw buffer instead:", e);
    }
    
    await fs.writeFile(targetPath, processedBuffer);
    return `/uploads/images/${fileName}`;
  } else {
    // For PDF files
    const targetPath = path.join(pdfsDir, fileName);
    await fs.writeFile(targetPath, buffer);
    return `/uploads/pdfs/${fileName}`;
  }
}

// Convert image buffer to webp
export async function convertImageBufferToWebp(buffer: Buffer, webpFileName: string) {
  await ensureUploadDirectories();
  const targetPath = path.join(webpDir, webpFileName);
  await sharp(buffer).webp({ quality: 80 }).toFile(targetPath);
  return `/uploads/webp/${webpFileName}`;
}

// Delete media files from disk based on subfolders
export async function deleteMediaFiles(fileName: string, fileType: "IMAGE" | "PDF", webpUrl?: string) {
  const unlinkIfExists = async (filePath: string) => {
    try {
      await fs.unlink(filePath);
    } catch (error: unknown) {
      const err = error as { code?: string };
      if (err.code !== "ENOENT") {
        throw error;
      }
    }
  };

  if (fileType === "IMAGE") {
    const originalPath = path.join(imagesDir, fileName);
    await unlinkIfExists(originalPath);

    if (webpUrl) {
      const webpFileName = path.basename(webpUrl);
      const webpPath = path.join(webpDir, webpFileName);
      await unlinkIfExists(webpPath);
    }
  } else {
    const originalPath = path.join(pdfsDir, fileName);
    await unlinkIfExists(originalPath);
  }
}
