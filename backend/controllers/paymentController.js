import Payment from "../models/Payment.js";
import Student from "../models/Student.js";

// ==========================================
// ADD PAYMENT
// ==========================================

export const addPayment = async (req, res) => {
  try {
    const {
      student,
      amount,
      paymentMethod,
      paymentDate,
      note,
    } = req.body;

    // Required fields
    if (!student || !amount || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Student, amount and payment method are required",
      });
    }

    // Find student
    const existingStudent = await Student.findById(student);

    if (!existingStudent) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Check if payment exceeds remaining fee
    const remainingFee =
      existingStudent.totalFee - existingStudent.totalPaid;

    if (amount > remainingFee) {
      return res.status(400).json({
        success: false,
        message: `Payment cannot be greater than remaining fee of ₹${remainingFee}`,
      });
    }

    // Create payment
    const payment = await Payment.create({
      student,
      amount,
      paymentMethod,
      paymentDate,
      note,
    });

    // Update student's total paid amount
    existingStudent.totalPaid += amount;

    await existingStudent.save();

    // Return payment with student information
    const populatedPayment = await Payment.findById(payment._id).populate(
      "student",
      "name mobile totalFee totalPaid"
    );

    res.status(201).json({
      success: true,
      message: "Payment recorded successfully",
      payment: populatedPayment,
      remainingFee:
        existingStudent.totalFee - existingStudent.totalPaid,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// GET ALL PAYMENTS
// ==========================================

export const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate(
        "student",
        "name mobile totalFee totalPaid"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// GET PAYMENTS OF ONE STUDENT
// ==========================================

export const getStudentPayments = async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const payments = await Payment.find({
      student: req.params.studentId,
    }).sort({ paymentDate: -1 });

    const totalPaid = student.totalPaid;
    const totalFee = student.totalFee;
    const remainingFee = totalFee - totalPaid;

    res.status(200).json({
      success: true,
      student: {
        id: student._id,
        name: student.name,
        mobile: student.mobile,
      },
      summary: {
        totalFee,
        totalPaid,
        remainingFee,
      },
      payments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// DELETE PAYMENT
// ==========================================

export const deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    const student = await Student.findById(payment.student);

    if (student) {
      student.totalPaid -= payment.amount;

      if (student.totalPaid < 0) {
        student.totalPaid = 0;
      }

      await student.save();
    }

    await Payment.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Payment deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};