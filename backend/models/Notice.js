import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: [
        "government_scheme",
        "job",
        "scholarship",
        "exam",
        "general",
      ],
      default: "general",
    },

    startDate: {
      type: Date,
    },

    lastDate: {
      type: Date,
    },

    requiredDocuments: [
      {
        type: String,
        trim: true,
      },
    ],

    status: {
      type: String,
      enum: ["open", "closing_soon", "closed"],
      default: "open",
    },

    isPinned: {
      type: Boolean,
      default: false,
    },

    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Notice = mongoose.model("Notice", noticeSchema);

export default Notice;