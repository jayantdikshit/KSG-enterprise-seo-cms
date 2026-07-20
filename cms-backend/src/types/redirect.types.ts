import type { Document } from 'mongoose';

export interface RedirectDocument extends Document {
  sourcePath: string;
  targetPath: string;
  statusCode: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RedirectDTO {
  _id: string;
  sourcePath: string;
  targetPath: string;
  statusCode: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
