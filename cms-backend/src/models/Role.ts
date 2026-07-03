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

let RoleModel: mongoose.Model<any>;
try {
  RoleModel = mongoose.model("Role");
} catch (error) {
  RoleModel = mongoose.model("Role", RoleSchema);
}

export default RoleModel;