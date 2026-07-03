import { z } from "zod";

const categoryBaseSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  slug: z
    .preprocess(
      (val) => (typeof val === "string" ? val.toLowerCase().trim() : val),
      z.string()
        .min(2, "Slug must be at least 2 characters")
        .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens")
    ),
  description: z.string().optional(),
});

export const createCategorySchema = categoryBaseSchema.extend({
  description: z.string().optional().default(""),
});

export const updateCategorySchema = categoryBaseSchema.partial();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
