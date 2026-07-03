import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdOrEmptyRegex = /^$|^\s*$|^[0-9a-fA-F]{24}$/;

const makeObjectIdSchema = (message: string) =>
  z.preprocess(
    (val) => {
      if (typeof val === "string") {
        const trimmed = val.trim();
        return trimmed === "" || trimmed === "null" || trimmed === "undefined" ? null : trimmed;
      }
      return val === undefined || val === null ? null : val;
    },
    z.string().regex(objectIdOrEmptyRegex, message).nullable().optional()
  );

const menuItemSchema = z.object({
  _id: z.string().regex(objectIdRegex).optional(),
  label: z.string().min(1, "Label is required").max(100),
  type: z.enum(["PAGE", "SERVICE", "BLOG_CATEGORY", "CUSTOM", "EXTERNAL"]),
  
  pageId: makeObjectIdSchema("Invalid Page ID format"),
  serviceId: makeObjectIdSchema("Invalid Service ID format"),
  blogCategoryId: makeObjectIdSchema("Invalid Category ID format"),
  
  url: z.string().optional().default(""),
  target: z.enum(["_self", "_blank"]).optional().default("_self"),
  icon: z.string().optional().default(""),
  order: z.number().int().optional().default(0),
  
  parentId: makeObjectIdSchema("Invalid Parent ID format"),
  isActive: z.boolean().optional().default(true),
});

const menuBaseSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(100),
  location: z
    .preprocess(
      (val) => (typeof val === "string" ? val.toLowerCase().trim() : val),
      z.string().nullable().optional()
    ),
  items: z.array(menuItemSchema).optional(),
});

export const createMenuSchema = menuBaseSchema.extend({
  location: z
    .preprocess(
      (val) => (typeof val === "string" ? val.toLowerCase().trim() : val),
      z.string().nullable().optional()
    )
    .default(null),
  items: z.array(menuItemSchema).optional().default([]),
});

export const updateMenuSchema = menuBaseSchema.partial();

export const reorderItemsSchema = z.object({
  items: z.array(
    z.object({
      itemId: z.string().regex(objectIdRegex, "Invalid Item ID format"),
      order: z.number().int(),
      parentId: makeObjectIdSchema("Invalid Parent ID format"),
    })
  ),
});

export const toggleItemSchema = z.object({
  itemId: z.string().regex(objectIdRegex, "Invalid Item ID format"),
  isActive: z.boolean(),
});

export type CreateMenuInput = z.infer<typeof createMenuSchema>;
export type UpdateMenuInput = z.infer<typeof updateMenuSchema>;
export type ReorderItemsInput = z.infer<typeof reorderItemsSchema>;
export type ToggleItemInput = z.infer<typeof toggleItemSchema>;
