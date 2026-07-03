import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createMediaSchema = z.object({
  folder: z.string().min(1).optional(),
  alt: z.string().max(250).optional(),
  title: z.string().max(200).optional(),
  caption: z.string().max(500).optional(),
  description: z.string().max(1000).optional(),
});

export const updateMediaSchema = z.object({
  alt: z.string().max(250).optional(),
  title: z.string().max(200).optional(),
  caption: z.string().max(500).optional(),
  description: z.string().max(1000).optional(),
  folder: z.string().min(1).optional(),
});

export const createFolderSchema = z.object({
  name: z
    .string()
    .min(1, "Folder name is required")
    .max(100, "Folder name cannot exceed 100 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Folder name must contain only letters, numbers, hyphens, or underscores"),
});

export const renameFolderSchema = z.object({
  name: z
    .string()
    .min(1, "Folder name is required")
    .max(100, "Folder name cannot exceed 100 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Folder name must contain only letters, numbers, hyphens, or underscores"),
});

export const moveFilesSchema = z.object({
  ids: z.array(z.string().regex(objectIdRegex, "Invalid Media ID format")).min(1, "At least one file ID is required"),
  folder: z.string().min(1, "Target folder is required"),
});

export const bulkDeleteSchema = z.object({
  ids: z.array(z.string().regex(objectIdRegex, "Invalid Media ID format")).min(1, "At least one file ID is required"),
});

export type CreateMediaInput = z.infer<typeof createMediaSchema>;
export type UpdateMediaInput = z.infer<typeof updateMediaSchema>;
export type CreateFolderInput = z.infer<typeof createFolderSchema>;
export type RenameFolderInput = z.infer<typeof renameFolderSchema>;
export type MoveFilesInput = z.infer<typeof moveFilesSchema>;
export type BulkDeleteInput = z.infer<typeof bulkDeleteSchema>;
