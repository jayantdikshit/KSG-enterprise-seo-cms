import mongoose from "mongoose";

const RoleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      enum: [
        "SUPER_ADMIN",
        "EDITOR",
        "MARKETING_MANAGER",
        "SEO_MANAGER",
      ],
      unique: true,
    },

    permissions: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

let RoleModel: mongoose.Model<unknown>;
if (mongoose.models.Role) {
  RoleModel = mongoose.model<unknown>('Role');
} else {
  RoleModel = mongoose.model<unknown>('Role', RoleSchema);
}

export default RoleModel;