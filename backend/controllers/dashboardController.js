import Student from "../models/Student.js";
import Course from "../models/Course.js";
import Notice from "../models/Notice.js";
import Certificate from "../models/Certificate.js";
import Payment from "../models/Payment.js";

// ==========================================
// GET ADMIN DASHBOARD
// ==========================================

export const getDashboard = async (req, res) => {
  try {
    // ==========================================
    // BASIC COUNTS
    // ==========================================

    const totalStudents =
      await Student.countDocuments();

    const totalCourses =
      await Course.countDocuments();

    const activeCourses =
      await Course.countDocuments({
        isActive: true,
      });

    const totalNotices =
      await Notice.countDocuments();

    const publishedNotices =
      await Notice.countDocuments({
        isPublished: true,
      });

    const totalCertificates =
      await Certificate.countDocuments();

    const validCertificates =
      await Certificate.countDocuments({
        status: "valid",
      });

    // ==========================================
    // STUDENTS BY COURSE CATEGORY
    // ==========================================

    const studentsByCategory =
      await Student.aggregate([
        {
          $lookup: {
            from: "courses",
            localField: "course",
            foreignField: "_id",
            as: "courseData",
          },
        },

        {
          $unwind: "$courseData",
        },

        {
          $group: {
            _id: "$courseData.category",
            count: {
              $sum: 1,
            },
          },
        },
      ]);

    let computerStudents = 0;
    let tailoringStudents = 0;

    studentsByCategory.forEach((item) => {
      if (item._id === "computer") {
        computerStudents = item.count;
      }

      if (item._id === "tailoring") {
        tailoringStudents = item.count;
      }
    });

    // ==========================================
    // STUDENTS BY STATUS
    // ==========================================

    const activeStudents =
      await Student.countDocuments({
        status: "active",
      });

    const completedStudents =
      await Student.countDocuments({
        status: "completed",
      });

    const droppedStudents =
      await Student.countDocuments({
        status: "dropped",
      });

    // ==========================================
    // FEE CALCULATION
    // ==========================================

    const feeData =
      await Student.aggregate([
        {
          $group: {
            _id: null,

            totalFee: {
              $sum: "$totalFee",
            },

            totalPaid: {
              $sum: "$totalPaid",
            },
          },
        },
      ]);

    let totalFee = 0;
    let totalPaid = 0;

    if (feeData.length > 0) {
      totalFee = feeData[0].totalFee;
      totalPaid = feeData[0].totalPaid;
    }

    const totalPending =
      totalFee - totalPaid;

    // ==========================================
    // PAYMENT RECORDS
    // ==========================================

    const totalPaymentRecords =
      await Payment.countDocuments();

    // ==========================================
    // TOTAL PAYMENT AMOUNT
    // ==========================================

    const paymentData =
      await Payment.aggregate([
        {
          $group: {
            _id: null,

            totalCollected: {
              $sum: "$amount",
            },
          },
        },
      ]);

    const totalCollectedFromPayments =
      paymentData.length > 0
        ? paymentData[0].totalCollected
        : 0;

    // ==========================================
    // NOTICE STATUS
    // ==========================================

    const openNotices =
      await Notice.countDocuments({
        status: "open",
        isPublished: true,
      });

    const closingSoonNotices =
      await Notice.countDocuments({
        status: "closing_soon",
        isPublished: true,
      });

    const closedNotices =
      await Notice.countDocuments({
        status: "closed",
      });

    // ==========================================
    // RECENT STUDENTS
    // ==========================================

    const recentStudents =
      await Student.find()
        .populate(
          "course",
          "name category"
        )
        .sort({
          createdAt: -1,
        })
        .limit(5)
        .select(
          "name mobile status totalFee totalPaid admissionDate course"
        );

    // ==========================================
    // RECENT CERTIFICATES
    // ==========================================

    const recentCertificates =
      await Certificate.find()
        .sort({
          createdAt: -1,
        })
        .limit(5)
        .select(
          "certificateNumber studentName courseName category issueDate status"
        );

    // ==========================================
    // RECENT NOTICES
    // ==========================================

    const recentNotices =
      await Notice.find()
        .sort({
          createdAt: -1,
        })
        .limit(5)
        .select(
          "title category status lastDate isPinned isPublished createdAt"
        );

    // ==========================================
    // SEND RESPONSE
    // ==========================================

    res.status(200).json({
      success: true,

      dashboard: {
        // ========================================
        // MAIN STATISTICS
        // ========================================

        stats: {
          totalStudents,

          computerStudents,

          tailoringStudents,

          totalCourses,

          activeCourses,

          totalNotices,

          publishedNotices,

          totalCertificates,

          validCertificates,
        },

        // ========================================
        // STUDENT STATISTICS
        // ========================================

        students: {
          total: totalStudents,

          active: activeStudents,

          completed: completedStudents,

          dropped: droppedStudents,

          computer: computerStudents,

          tailoring: tailoringStudents,
        },

        // ========================================
        // FEE STATISTICS
        // ========================================

        fees: {
          totalFee,

          totalPaid,

          totalPending,

          totalPaymentRecords,

          totalCollectedFromPayments,
        },

        // ========================================
        // CERTIFICATE STATISTICS
        // ========================================

        certificates: {
          total: totalCertificates,

          valid: validCertificates,

          revoked:
            totalCertificates -
            validCertificates,
        },

        // ========================================
        // NOTICE STATISTICS
        // ========================================

        notices: {
          total: totalNotices,

          published: publishedNotices,

          open: openNotices,

          closingSoon:
            closingSoonNotices,

          closed: closedNotices,
        },

        // ========================================
        // RECENT DATA
        // ========================================

        recentStudents,

        recentCertificates,

        recentNotices,
      },
    });
  } catch (error) {
    console.error(
      "Dashboard Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};