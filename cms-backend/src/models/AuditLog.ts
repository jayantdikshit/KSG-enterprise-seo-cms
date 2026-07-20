import mongoose from "mongoose";

const AuditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    action: {
      type: String,
      required: true,
      enum: ["CREATE", "UPDATE", "DELETE", "PUBLISH", "UNPUBLISH"],
    },

    entity: {
      type: String,
      required: true,
      enum: ["PAGE", "SERVICE", "BLOG", "BLOG_CATEGORY", "MEDIA", "USER", "ROLE", "LEAD"],
    },

    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    oldData: {
      type: mongoose.Schema.Types.Mixed,
    },

    newData: {
      type: mongoose.Schema.Types.Mixed,
    },

    ipAddress: String,

    userAgent: String,

    status: {
      type: String,
      enum: ["SUCCESS", "FAILED"],
      default: "SUCCESS",
    },

    errorMessage: String,

    // Legacy fields for backward compatibility
    module: String,

    meta: Object,

    ip: String,
  },
  { timestamps: true }
);

if (mongoose.models && mongoose.models.AuditLog) {
  delete (mongoose.models as Record<string, unknown>)['AuditLog'];
}
const AuditLog = mongoose.model("AuditLog", AuditLogSchema);
export default AuditLog;