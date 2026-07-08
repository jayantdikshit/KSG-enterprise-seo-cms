import { z } from 'zod';

export const redirectSchema = z.object({
  sourcePath: z.string().min(1, 'Source path required'),
  targetPath: z.string().min(1, 'Target path required'),
  // Accept 301 or 302 as number or numeric string, default 301
  statusCode: z.coerce.number().int().refine(val => [301,302].includes(val), { message: 'Invalid status code' }).default(301),
  active: z.boolean().default(true),
});
