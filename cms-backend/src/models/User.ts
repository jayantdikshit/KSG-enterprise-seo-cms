import mongoose, { Types, Document } from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: Types.ObjectId, ref: 'Role', required: true },
    refreshToken: { type: String },
    isActive: { type: Boolean, default: true },
    loginAttempts: { type: Number, default: 0 },
    lockedUntil: { type: Date },
  },
  { timestamps: true }
);

let UserModel: mongoose.Model<Document>;
if (mongoose.models.User) {
  UserModel = mongoose.model<Document>('User');
} else {
  UserModel = mongoose.model<Document>('User', UserSchema);
}

export default UserModel;