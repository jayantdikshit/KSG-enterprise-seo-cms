export type MediaFileType = "IMAGE" | "PDF";

export interface CreateMediaDTO {
  originalName: string;
  fileName: string;
  mimeType: string;
  fileType: MediaFileType;
  extension: string;
  size: number;
  folder?: string;
  alt?: string;
  altText?: string;
  title?: string;
  caption?: string;
  description?: string;
  width?: number;
  height?: number;
  url: string;
  webpUrl?: string;
  uploadedBy: string;
  createdBy: string;
}

export interface CreateMediaUploadDTO {
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  folder?: string;
  alt?: string;
  title?: string;
  caption?: string;
  description?: string;
}

export interface UpdateMediaDTO {
  alt?: string;
  title?: string;
  caption?: string;
  description?: string;
  folder?: string;
}

export interface MediaDTO {
  _id: string;
  originalName: string;
  fileName: string;
  mimeType: string;
  fileType: MediaFileType;
  extension: string;
  size: number;
  folder: string;
  alt: string;
  altText: string;
  title: string;
  caption: string;
  description: string;
  width?: number;
  height?: number;
  url: string;
  webpUrl?: string;
  uploadedBy: string;
  createdBy: string;
  updatedBy?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FolderDTO {
  _id: string;
  name: string;
  parentFolder: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
