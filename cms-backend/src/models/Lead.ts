import mongoose from "mongoose";

const LeadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, "Phone is required"],
      trim: true,
    },
    companyName: {
      type: String,
      trim: true,
      default: "",
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["NEW", "CONTACTED", "QUALIFIED", "CLOSED"],
      default: "NEW",
    },
    ipAddress: {
      type: String,
      default: "unknown",
    },
    userAgent: {
      type: String,
      default: "unknown",
    },
  },
  { timestamps: true }
);

// Prevent re-compilation of models during dev hot reloads
let LeadModel: mongoose.Model<unknown>;
try {
  LeadModel = mongoose.model("Lead");
} catch (e) {
  LeadModel = mongoose.model("Lead", LeadSchema);
}

export default LeadModel;
