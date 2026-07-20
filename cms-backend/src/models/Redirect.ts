import mongoose from 'mongoose';
import type { RedirectDocument } from '../types/redirect.types';

const RedirectSchema = new mongoose.Schema({
  sourcePath: { type: String, required: true, trim: true },
  targetPath: { type: String, required: true, trim: true },
  statusCode: { type: Number, enum: [301, 302], default: 301 },
  active: { type: Boolean, default: true },
}, { timestamps: true });

let RedirectModel: mongoose.Model<RedirectDocument>;
try {
  RedirectModel = mongoose.model<RedirectDocument>('Redirect');
} catch (e) {
  RedirectModel = mongoose.model<RedirectDocument>('Redirect', RedirectSchema);
}

export default RedirectModel;
