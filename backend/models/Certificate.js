import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    certificateNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    studentName: {
      type: String,
      required: true,
      trim: true,
    },

    courseName: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: ["computer", "tailoring"],
      required: true,
    },

    duration: {
      type: String,
      required: true,
    },

    completionDate: {
      type: Date,
      required: true,
    },

    issueDate: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: ["valid", "revoked"],
      default: "valid",
    },
  },
  {
    timestamps: true,
  }
);

const Certificate = mongoose.model(
  "Certificate",
  certificateSchema
);

export default Certificate;