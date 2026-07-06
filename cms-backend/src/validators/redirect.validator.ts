import { z } from 'zod';

export const redirectSchema = z.object({
  sourcePath: z.string().min(1, 'Source path required'),
  targetPath: z.string().min(1, 'Target path required'),
  statusCode: z.enum([301, 302]).default(301),
  active: z.boolean().default(true),
});
