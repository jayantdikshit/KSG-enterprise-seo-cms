import type { Document } from 'mongoose';

export interface RedirectDocument extends Document {
  sourcePath: string;
  targetPath: string;
  statusCode: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}
