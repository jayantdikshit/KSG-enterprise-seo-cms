import mongoose from "mongoose";

const TeamMemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Team member name is required"],
    trim: true,
  },
  designation: {
    type: String,
    required: [true, "Team member designation is required"],
    trim: true,
  },
  image: {
    type: String,
    default: "",
    trim: true,
  },
  linkedin: {
    type: String,
    default: "",
    trim: true,
  },
  twitter: {
    type: String,
    default: "",
    trim: true,
  },
  email: {
    type: String,
    default: "",
    trim: true,
  },
  order: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

const StatisticSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Statistic title is required"],
    trim: true,
  },
  value: {
    type: Number,
    required: [true, "Statistic value is required"],
  },
  suffix: {
    type: String,
    default: "",
    trim: true,
  },
  icon: {
    type: String,
    default: "",
    trim: true,
  },
  order: {
    type: Number,
    default: 0,
  },
});

const AboutSchema = new mongoose.Schema(
  {
    companyOverview: {
      type: String,
      required: [true, "Company overview is required"],
      trim: true,
    },
    mission: {
      type: String,
      required: [true, "Mission statement is required"],
      trim: true,
    },
    vision: {
      type: String,
      required: [true, "Vision statement is required"],
      trim: true,
    },
    teamMembers: {
      type: [TeamMemberSchema],
      default: [],
    },
    statistics: {
      type: [StatisticSchema],
      default: [],
    },
    images: {
      type: [String],
      default: [],
    },
    seoTitle: {
      type: String,
      default: "",
      trim: true,
    },
    metaDescription: {
      type: String,
      default: "",
      trim: true,
    },
    metaKeywords: {
      type: String,
      default: "",
      trim: true,
    },
    canonicalUrl: {
      type: String,
      default: "",
      trim: true,
    },
    ogTitle: {
      type: String,
      default: "",
      trim: true,
    },
    ogDescription: {
      type: String,
      default: "",
      trim: true,
    },
    ogImage: {
      type: String,
      default: "",
      trim: true,
    },
    twitterCard: {
      type: String,
      default: "summary_large_image",
      trim: true,
    },
    schemaMarkup: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

// Prevent re-compilation of models during dev hot reloads
let AboutModel: mongoose.Model<unknown>;
try {
  AboutModel = mongoose.model("About");
} catch (e) {
  AboutModel = mongoose.model("About", AboutSchema);
}

export default AboutModel;
