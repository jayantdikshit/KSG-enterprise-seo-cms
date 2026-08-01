import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a buffer to Cloudinary using upload_stream
 * @param buffer - File buffer to upload
 * @param folder - Folder path in Cloudinary (e.g. "cms_images")
 * @param resourceType - "auto", "image", "video", or "raw"
 * @returns Cloudinary UploadApiResponse
 */
export const uploadToCloudinary = (
  buffer: Buffer,
  folder: string,
  resourceType: 'auto' | 'image' | 'video' | 'raw' = 'auto'
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error("Cloudinary upload failed: no result"));
        resolve(result);
      }
    );

    // Pipe the buffer to Cloudinary
    uploadStream.end(buffer);
  });
};

/**
 * Deletes a file from Cloudinary by its public ID
 * @param publicId - Cloudinary public_id (including folder path)
 * @param resourceType - "image", "video", or "raw" (must match original upload type)
 */
export const deleteFromCloudinary = async (
  publicId: string,
  resourceType: 'image' | 'video' | 'raw' = 'image'
): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    console.warn(`Failed to delete ${publicId} from Cloudinary:`, error);
  }
};
