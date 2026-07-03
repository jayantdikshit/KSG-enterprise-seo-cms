import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: { type: String, required: true, unique: true },

    password: { type: String, required: true },

    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },

    refreshToken: { type: String },

    isActive: { type: Boolean, default: true },

    loginAttempts: { type: Number, default: 0 },

    lockedUntil: { type: Date },
  },
  { timestamps: true }
);

let UserModel: mongoose.Model<any>;
try {
  UserModel = mongoose.model("User");
} catch (error) {
  UserModel = mongoose.model("User", UserSchema);
}

export default UserModel;