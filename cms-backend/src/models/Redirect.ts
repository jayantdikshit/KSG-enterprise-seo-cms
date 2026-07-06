import mongoose from 'mongoose';

const RedirectSchema = new mongoose.Schema({
  sourcePath: { type: String, required: true, trim: true },
  targetPath: { type: String, required: true, trim: true },
  statusCode: { type: Number, enum: [301, 302], default: 301 },
  active: { type: Boolean, default: true },
}, { timestamps: true });

let RedirectModel: mongoose.Model<any>;
try {
  RedirectModel = mongoose.model('Redirect');
} catch (e) {
  RedirectModel = mongoose.model('Redirect', RedirectSchema);
}

export default RedirectModel;
