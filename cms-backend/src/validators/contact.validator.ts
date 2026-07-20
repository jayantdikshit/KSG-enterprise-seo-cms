import { z } from "zod";

export const createContactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name cannot exceed 100 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(5, "Phone number must be at least 5 characters").max(20, "Phone number cannot exceed 20 characters"),
  companyName: z.string().optional().default(""),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000, "Message cannot exceed 2000 characters"),
  captchaToken: z.string().optional(),
});

export const updateLeadSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100).optional(),
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().min(5, "Phone number must be at least 5 characters").max(20).optional(),
  companyName: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000).optional(),
  status: z.enum(["NEW", "CONTACTED", "QUALIFIED", "CLOSED"]).optional(),
  notes: z.array(z.object({
    content: z.string(),
    author: z.string(),
    createdAt: z.string().or(z.date()).optional()
  })).optional(),
});

export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
