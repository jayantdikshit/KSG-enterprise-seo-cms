import mongoose from "mongoose";

const FolderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Folder name is required"],
      unique: true,
      trim: true,
    },
    parentFolder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

let FolderModel: mongoose.Model<any>;
try {
  if (mongoose.models && mongoose.models.Folder) {
    delete (mongoose.models as any).Folder;
  }
  FolderModel = mongoose.model("Folder", FolderSchema);
} catch (e) {
  FolderModel = mongoose.model("Folder", FolderSchema);
}

export default FolderModel;
