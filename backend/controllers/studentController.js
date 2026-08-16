import mongoose from "mongoose";
import Student from "../models/Student.js";
import Course from "../models/Course.js";
import Payment from "../models/Payment.js";

// ==========================================
// CREATE STUDENT
// ==========================================

export const createStudent = async (req, res) => {
  try {
    const {
      name,
      mobile,
      email,
      address,
      dateOfBirth,
      gender,
      course,
      admissionDate,
      courseStartDate,
      courseEndDate,
      totalFee,
      totalPaid,
      paymentMethod,
      paymentNote,
      paymentDate,
    } = req.body;

    // ==========================================
    // REQUIRED FIELDS
    // ==========================================

    if (
      !name ||
      !mobile ||
      !course ||
      totalFee === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, mobile, course and total fee are required",
      });
    }

    // ==========================================
    // CHECK COURSE
    // ==========================================

    const existingCourse = await Course.findById(course);

    if (!existingCourse) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // ==========================================
    // PAYMENT VALUES
    // ==========================================

    const paidAmount = Number(totalPaid) || 0;
    const feeAmount = Number(totalFee);

    // ==========================================
    // VALIDATE FEE
    // ==========================================

    if (feeAmount < 0) {
      return res.status(400).json({
        success: false,
        message: "Total fee cannot be negative",
      });
    }

    if (paidAmount < 0) {
      return res.status(400).json({
        success: false,
        message: "Paid amount cannot be negative",
      });
    }

    if (paidAmount > feeAmount) {
      return res.status(400).json({
        success: false,
        message:
          "Paid amount cannot be greater than total fee",
      });
    }

    // ==========================================
    // VALIDATE PAYMENT METHOD
    // ==========================================

    const allowedPaymentMethods = [
      "cash",
      "upi",
      "bank_transfer",
      "other",
    ];

    if (
      paidAmount > 0 &&
      !allowedPaymentMethods.includes(paymentMethod)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please select a valid payment method",
      });
    }

    // ==========================================
    // CREATE STUDENT
    // ==========================================

    // const student = await Student.create({
    //   name: name.trim(),
    //   mobile: mobile.trim(),
    //   email: email?.trim() || undefined,
    //   address: address?.trim() || undefined,
    //   dateOfBirth: dateOfBirth || undefined,
    //   gender: gender || undefined,
    //   course,
    //   admissionDate: admissionDate || undefined,
    //   courseStartDate: courseStartDate || undefined,
    //   courseEndDate: courseEndDate || undefined,
    //   totalFee: feeAmount,
    //   totalPaid: paidAmount,
    // });

    const student = await Student.create({
  name: name.trim(),
  mobile: mobile.trim(),
  email: email?.trim() || undefined,
  address: address?.trim() || undefined,
  dateOfBirth: dateOfBirth || undefined,
  gender: gender || undefined,
  course,
  admissionDate: admissionDate || undefined,
  courseStartDate: courseStartDate || undefined,
  courseEndDate: courseEndDate || undefined,
  totalFee: feeAmount,
  totalPaid: paidAmount,
  paymentMethod:
    paidAmount > 0
      ? paymentMethod
      : "cash",
});

    // ==========================================
    // CREATE PAYMENT RECORD
    // ==========================================

    let payment = null;

    if (paidAmount > 0) {
      payment = await Payment.create({
        student: student._id,
        amount: paidAmount,
        paymentMethod,
        paymentDate: paymentDate || new Date(),
        note: paymentNote?.trim() || undefined,
      });
    }

    // ==========================================
    // POPULATE STUDENT
    // ==========================================

    const populatedStudent =
      await Student.findById(student._id).populate(
        "course",
        "name category duration fee"
      );

    // ==========================================
    // RESPONSE
    // ==========================================

    res.status(201).json({
      success: true,
      message: "Student registered successfully",
      student: populatedStudent,
      payment,
    });
  } catch (error) {
    console.error("Create Student Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// GET ALL STUDENTS
// ==========================================

export const getStudents = async (req, res) => {
  try {
    const students = await Student.find()
      .populate(
        "course",
        "name category duration fee"
      )
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      count: students.length,
      students,
    });
  } catch (error) {
    console.error("Get Students Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// SEARCH / FILTER / PAGINATE STUDENTS
// ==========================================

export const searchStudents = async (req, res) => {
  try {
    const {
      search,
      name,
      mobile,
      course,
      category,
      status,
      page = 1,
      limit = 10,
    } = req.query;

    const pageNumber = Math.max(
      parseInt(page) || 1,
      1
    );

    const limitNumber = Math.min(
      Math.max(parseInt(limit) || 10, 1),
      100
    );

    const skip =
      (pageNumber - 1) * limitNumber;

    const filter = {};

    // Search name or mobile
    if (search && search.trim()) {
      filter.$or = [
        {
          name: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          mobile: {
            $regex: search.trim(),
            $options: "i",
          },
        },
      ];
    }

    // Name
    if (name && name.trim()) {
      filter.name = {
        $regex: name.trim(),
        $options: "i",
      };
    }

    // Mobile
    if (mobile && mobile.trim()) {
      filter.mobile = {
        $regex: mobile.trim(),
        $options: "i",
      };
    }

    // Course
    if (course) {
      if (!mongoose.Types.ObjectId.isValid(course)) {
        return res.status(400).json({
          success: false,
          message: "Invalid course ID",
        });
      }

      filter.course = course;
    }

    // Status
    if (status) {
      const allowedStatuses = [
        "active",
        "completed",
        "dropped",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid status. Use active, completed or dropped",
        });
      }

      filter.status = status;
    }

    // Category
    if (category) {
      const allowedCategories = [
        "computer",
        "tailoring",
      ];

      if (!allowedCategories.includes(category)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid category. Use computer or tailoring",
        });
      }

      const categoryCourses = await Course.find({
        category,
      }).select("_id");

      const courseIds = categoryCourses.map(
        (item) => item._id
      );

      filter.course = {
        $in: courseIds,
      };
    }

    // Total
    const totalStudents =
      await Student.countDocuments(filter);

    // Students
    const students = await Student.find(filter)
      .populate(
        "course",
        "name category duration fee"
      )
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limitNumber);

    const totalPages = Math.ceil(
      totalStudents / limitNumber
    );

    res.status(200).json({
      success: true,
      count: students.length,
      students,
      pagination: {
        totalStudents,
        currentPage: pageNumber,
        totalPages,
        limit: limitNumber,
        hasNextPage:
          pageNumber < totalPages,
        hasPreviousPage:
          pageNumber > 1,
      },
    });
  } catch (error) {
    console.error(
      "Search Students Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// GET SINGLE STUDENT
// ==========================================

export const getStudentById = async (
  req,
  res
) => {
  try {
    const student =
      await Student.findById(
        req.params.id
      ).populate(
        "course",
        "name category duration fee"
      );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.status(200).json({
      success: true,
      student,
    });
  } catch (error) {
    console.error(
      "Get Student Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// UPDATE STUDENT
// ==========================================

export const updateStudent = async (
  req,
  res
) => {
  try {
    const existingStudent =
      await Student.findById(
        req.params.id
      );

    if (!existingStudent) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Check course
    if (req.body.course) {
      const existingCourse =
        await Course.findById(
          req.body.course
        );

      if (!existingCourse) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }
    }

    const newTotalFee =
      req.body.totalFee !== undefined
        ? Number(req.body.totalFee)
        : existingStudent.totalFee;

    const newTotalPaid =
      req.body.totalPaid !== undefined
        ? Number(req.body.totalPaid)
        : existingStudent.totalPaid;

    if (newTotalFee < 0) {
      return res.status(400).json({
        success: false,
        message:
          "Total fee cannot be negative",
      });
    }

    if (newTotalPaid < 0) {
      return res.status(400).json({
        success: false,
        message:
          "Paid amount cannot be negative",
      });
    }

    if (newTotalPaid > newTotalFee) {
      return res.status(400).json({
        success: false,
        message:
          "Paid amount cannot be greater than total fee",
      });
    }

    const student =
      await Student.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      ).populate(
        "course",
        "name category duration fee"
      );

    res.status(200).json({
      success: true,
      message:
        "Student updated successfully",
      student,
    });
  } catch (error) {
    console.error(
      "Update Student Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// DELETE STUDENT
// ==========================================

export const deleteStudent = async (
  req,
  res
) => {
  try {
    const student =
      await Student.findByIdAndDelete(
        req.params.id
      );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Delete payment records belonging
    // to this student
    await Payment.deleteMany({
      student: student._id,
    });

    res.status(200).json({
      success: true,
      message:
        "Student and payment records deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete Student Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};