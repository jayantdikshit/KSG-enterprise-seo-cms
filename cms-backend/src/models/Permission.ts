import mongoose from "mongoose";

const PermissionSchema = new mongoose.Schema(
  {
    name: { type: String, unique: true },
    module: { type: String },
  },
  { timestamps: true }
);

let PermissionModel: mongoose.Model<unknown>;
try {
  PermissionModel = mongoose.model("Permission");
} catch (error) {
  PermissionModel = mongoose.model("Permission", PermissionSchema);
}

export default PermissionModel;