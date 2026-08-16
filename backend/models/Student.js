import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    mobile: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    address: {
      type: String,
      trim: true,
    },

    dateOfBirth: {
      type: Date,
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    admissionDate: {
      type: Date,
      default: Date.now,
    },

    courseStartDate: {
      type: Date,
    },

    courseEndDate: {
      type: Date,
    },

    status: {
      type: String,
      enum: ["active", "completed", "dropped"],
      default: "active",
    },

    totalFee: {
      type: Number,
      required: true,
      min: 0,
    },

    totalPaid: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ✅ PAYMENT METHOD
    paymentMethod: {
      type: String,
      enum: [
        "cash",
        "upi",
        "bank_transfer",
        "other",
      ],
      default: "cash",
    },
  },

  // Schema options
  {
    timestamps: true,
  }
);

const Student = mongoose.model(
  "Student",
  studentSchema
);

export default Student;