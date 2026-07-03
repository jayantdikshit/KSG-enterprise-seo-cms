import mongoose from "mongoose";

const MediaSchema = new mongoose.Schema(
  {
    originalName: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
      unique: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      enum: ["IMAGE", "PDF"],
      required: true,
    },
    extension: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    folder: {
      type: String,
      default: "uncategorized",
      index: true,
    },
    url: {
      type: String,
      required: true,
    },
    webpUrl: {
      type: String,
    },
    alt: {
      type: String,
      default: "",
    },
    altText: {
      type: String,
      default: "",
    },
    title: {
      type: String,
      default: "",
    },
    caption: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    width: {
      type: Number,
    },
    height: {
      type: Number,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Pre-save hook to keep createdBy and altText synced
MediaSchema.pre("save", function (next) {
  if (this.uploadedBy && !this.createdBy) {
    this.createdBy = this.uploadedBy;
  }
  if (this.alt && !this.altText) {
    this.altText = this.alt;
  }
  if (typeof next === "function") {
    next();
  }
});

let MediaModel: mongoose.Model<any>;
try {
  // Overwrite models on rebuild to prevent re-compilation errors in development
  if (mongoose.models && mongoose.models.Media) {
    delete (mongoose.models as any).Media;
  }
  MediaModel = mongoose.model("Media", MediaSchema);
} catch (e) {
  MediaModel = mongoose.model("Media", MediaSchema);
}

export default MediaModel;
