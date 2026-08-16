import Certificate from "../models/Certificate.js";
import Student from "../models/Student.js";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";

// ==========================================
// GENERATE CERTIFICATE
// ==========================================

export const generateCertificate = async (req, res) => {
  try {
    const { studentId, completionDate } = req.body;

    // Check student ID
    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required",
      });
    }

    // Find student and course
    const student = await Student.findById(studentId).populate("course");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Check course
    if (!student.course) {
      return res.status(400).json({
        success: false,
        message: "Student does not have a course",
      });
    }

    // Check if course is completed
    if (student.status !== "completed") {
      return res.status(400).json({
        success: false,
        message:
          "Student must complete the course before generating a certificate",
      });
    }

    // Check if certificate already exists
    const existingCertificate = await Certificate.findOne({
      student: studentId,
    });

    if (existingCertificate) {
      return res.status(400).json({
        success: false,
        message: "Certificate already exists for this student",
        certificate: existingCertificate,
      });
    }

    // Determine category
    const category = student.course.category;

    // Certificate prefix
    const prefix =
      category === "computer"
        ? "CTC-COMP"
        : "CTC-TAIL";

    // Current year
    const year = new Date().getFullYear();

    // Count certificates for this category and year
    const count = await Certificate.countDocuments({
      category,
      certificateNumber: {
        $regex: `^${prefix}-${year}-`,
      },
    });

    // Generate certificate number
    const certificateNumber = `${prefix}-${year}-${String(
      count + 1
    ).padStart(5, "0")}`;

    // Create certificate
    const certificate = await Certificate.create({
      student: student._id,
      certificateNumber,
      studentName: student.name,
      courseName: student.course.name,
      category: student.course.category,
      duration: student.course.duration,
      completionDate: completionDate || new Date(),
    });

    // Populate student information
    const populatedCertificate =
      await Certificate.findById(certificate._id).populate(
        "student",
        "name mobile email"
      );

    res.status(201).json({
      success: true,
      message: "Certificate generated successfully",
      certificate: populatedCertificate,
    });
  } catch (error) {
    console.error("Generate Certificate Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// GET ALL CERTIFICATES
// ==========================================

export const getCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find()
      .populate("student", "name mobile email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: certificates.length,
      certificates,
    });
  } catch (error) {
    console.error("Get Certificates Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// GET SINGLE CERTIFICATE
// ==========================================

export const getCertificateById = async (req, res) => {
  try {
    const certificate = await Certificate.findById(
      req.params.id
    ).populate("student", "name mobile email");

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found",
      });
    }

    res.status(200).json({
      success: true,
      certificate,
    });
  } catch (error) {
    console.error("Get Certificate Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// VERIFY CERTIFICATE
// ==========================================
// Public route

export const verifyCertificate = async (req, res) => {
  try {
    const { certificateNumber } = req.params;

    const certificate = await Certificate.findOne({
      certificateNumber,
    }).populate("student", "name");

    if (!certificate) {
      return res.status(404).json({
        success: false,
        valid: false,
        message: "Certificate not found",
      });
    }

    if (certificate.status === "revoked") {
      return res.status(400).json({
        success: false,
        valid: false,
        message: "Certificate has been revoked",
      });
    }

    res.status(200).json({
      success: true,
      valid: true,
      message: "Certificate is valid",

      certificate: {
        certificateNumber: certificate.certificateNumber,
        studentName: certificate.studentName,
        courseName: certificate.courseName,
        category: certificate.category,
        duration: certificate.duration,
        completionDate: certificate.completionDate,
        issueDate: certificate.issueDate,
        status: certificate.status,
      },
    });
  } catch (error) {
    console.error("Verify Certificate Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// REVOKE CERTIFICATE
// ==========================================

export const revokeCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findByIdAndUpdate(
      req.params.id,
      {
        status: "revoked",
      },
      {
        new: true,
      }
    );

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Certificate revoked successfully",
      certificate,
    });
  } catch (error) {
    console.error("Revoke Certificate Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// DOWNLOAD PROFESSIONAL CERTIFICATE PDF
// ==========================================

export const downloadCertificatePDF = async (req, res) => {
  try {
    // ==========================================
    // FIND CERTIFICATE
    // ==========================================

    const certificate = await Certificate.findById(
      req.params.id
    ).populate("student", "name mobile email");

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found",
      });
    }

    // Don't allow revoked certificates
    if (certificate.status === "revoked") {
      return res.status(400).json({
        success: false,
        message: "This certificate has been revoked",
      });
    }

    // ==========================================
    // CENTER INFORMATION
    // ==========================================

    const centerName =
      "DIGITAL COMPUTER & TAILORING TRAINING CENTER";

    const centerAddress =
      "Haldia, West Bengal";

    const centerContact =
      "Computer Training  •  Tailoring Training";

    // ==========================================
    // CHECK FRONTEND URL
    // ==========================================

    if (!process.env.FRONTEND_URL) {
      return res.status(500).json({
        success: false,
        message: "FRONTEND_URL is not configured in .env",
      });
    }

    // ==========================================
    // VERIFICATION URL
    // ==========================================

    const verificationUrl =
      `${process.env.FRONTEND_URL}/verify/${certificate.certificateNumber}`;

    // ==========================================
    // GENERATE QR CODE
    // ==========================================

    const qrDataUrl = await QRCode.toDataURL(
      verificationUrl,
      {
        margin: 1,
        width: 300,
        errorCorrectionLevel: "H",
      }
    );

    const qrBuffer = Buffer.from(
      qrDataUrl.replace(
        /^data:image\/png;base64,/,
        ""
      ),
      "base64"
    );

    // ==========================================
    // CREATE PDF
    // ==========================================

    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margin: 0,

      info: {
        Title: `Certificate - ${certificate.studentName}`,
        Author: centerName,
        Subject: "Certificate of Completion",
      },
    });

    // ==========================================
    // RESPONSE HEADERS
    // ==========================================

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${certificate.certificateNumber}.pdf"`
    );

    // Pipe PDF to browser/Postman
    doc.pipe(res);

    // ==========================================
    // A4 LANDSCAPE SIZE
    // ==========================================

    const pageWidth = 841.89;
    const pageHeight = 595.28;

    // ==========================================
    // OUTER BORDER
    // ==========================================

    doc
      .lineWidth(6)
      .rect(
        18,
        18,
        pageWidth - 36,
        pageHeight - 36
      )
      .stroke();

    // ==========================================
    // INNER BORDER
    // ==========================================

    doc
      .lineWidth(1.5)
      .rect(
        30,
        30,
        pageWidth - 60,
        pageHeight - 60
      )
      .stroke();

    // ==========================================
    // DECORATIVE CORNERS
    // ==========================================

    // Top-left
    doc
      .moveTo(30, 65)
      .lineTo(30, 40)
      .lineTo(55, 40)
      .lineWidth(2)
      .stroke();

    // Top-right
    doc
      .moveTo(pageWidth - 30, 65)
      .lineTo(pageWidth - 30, 40)
      .lineTo(pageWidth - 55, 40)
      .lineWidth(2)
      .stroke();

    // Bottom-left
    doc
      .moveTo(30, pageHeight - 65)
      .lineTo(30, pageHeight - 40)
      .lineTo(55, pageHeight - 40)
      .lineWidth(2)
      .stroke();

    // Bottom-right
    doc
      .moveTo(pageWidth - 30, pageHeight - 65)
      .lineTo(pageWidth - 30, pageHeight - 40)
      .lineTo(pageWidth - 55, pageHeight - 40)
      .lineWidth(2)
      .stroke();

    // ==========================================
    // CENTER NAME
    // ==========================================

    doc
      .font("Helvetica-Bold")
      .fontSize(21)
      .text(
        centerName,
        70,
        55,
        {
          width: pageWidth - 140,
          align: "center",
        }
      );

    // ==========================================
    // ADDRESS
    // ==========================================

    doc
      .font("Helvetica")
      .fontSize(9)
      .text(
        centerAddress,
        70,
        82,
        {
          width: pageWidth - 140,
          align: "center",
        }
      );

    // ==========================================
    // CENTER CONTACT / COURSE TYPES
    // ==========================================

    doc
      .fontSize(8)
      .text(
        centerContact,
        70,
        96,
        {
          width: pageWidth - 140,
          align: "center",
        }
      );

    // ==========================================
    // DECORATIVE LINE
    // ==========================================

    doc
      .moveTo(180, 118)
      .lineTo(662, 118)
      .lineWidth(1)
      .stroke();

    // ==========================================
    // CERTIFICATE TITLE
    // ==========================================

    doc
      .font("Helvetica-Bold")
      .fontSize(30)
      .text(
        "CERTIFICATE",
        70,
        137,
        {
          width: pageWidth - 140,
          align: "center",
        }
      );

    doc
      .font("Helvetica")
      .fontSize(13)
      .text(
        "OF COMPLETION",
        70,
        174,
        {
          width: pageWidth - 140,
          align: "center",
        }
      );

    // ==========================================
    // PRESENTATION TEXT
    // ==========================================

    doc
      .font("Helvetica")
      .fontSize(11)
      .text(
        "This certificate is proudly presented to",
        70,
        210,
        {
          width: pageWidth - 140,
          align: "center",
        }
      );

    // ==========================================
    // STUDENT NAME
    // ==========================================

    doc
      .font("Helvetica-Bold")
      .fontSize(29)
      .text(
        certificate.studentName.toUpperCase(),
        80,
        237,
        {
          width: pageWidth - 160,
          align: "center",
        }
      );

    // Student name underline
    doc
      .moveTo(245, 275)
      .lineTo(597, 275)
      .lineWidth(1)
      .stroke();

    // ==========================================
    // COURSE TEXT
    // ==========================================

    doc
      .font("Helvetica")
      .fontSize(11)
      .text(
        "for successfully completing the",
        70,
        291,
        {
          width: pageWidth - 140,
          align: "center",
        }
      );

    // ==========================================
    // COURSE NAME
    // ==========================================

    doc
      .font("Helvetica-Bold")
      .fontSize(22)
      .text(
        certificate.courseName.toUpperCase(),
        120,
        316,
        {
          width: pageWidth - 240,
          align: "center",
        }
      );

    // ==========================================
    // DURATION
    // ==========================================

    doc
      .font("Helvetica")
      .fontSize(10)
      .text(
        `Course Duration: ${certificate.duration}`,
        70,
        348,
        {
          width: pageWidth - 140,
          align: "center",
        }
      );

    // ==========================================
    // DATES
    // ==========================================

    const completionDate = new Date(
      certificate.completionDate
    ).toLocaleDateString("en-IN");

    const issueDate = new Date(
      certificate.issueDate
    ).toLocaleDateString("en-IN");

    // ==========================================
    // CERTIFICATE NUMBER
    // ==========================================

    doc
      .font("Helvetica-Bold")
      .fontSize(8)
      .text(
        "CERTIFICATE NUMBER",
        70,
        408
      );

    doc
      .font("Helvetica")
      .fontSize(9)
      .text(
        certificate.certificateNumber,
        70,
        423
      );

    // ==========================================
    // COMPLETION DATE
    // ==========================================

    doc
      .font("Helvetica-Bold")
      .fontSize(8)
      .text(
        "COMPLETION DATE",
        300,
        408
      );

    doc
      .font("Helvetica")
      .fontSize(9)
      .text(
        completionDate,
        300,
        423
      );

    // ==========================================
    // ISSUE DATE
    // ==========================================

    doc
      .font("Helvetica-Bold")
      .fontSize(8)
      .text(
        "ISSUE DATE",
        470,
        408
      );

    doc
      .font("Helvetica")
      .fontSize(9)
      .text(
        issueDate,
        470,
        423
      );

    // ==========================================
    // QR CODE BOX
    // ==========================================

    doc
      .lineWidth(1)
      .rect(
        665,
        390,
        125,
        145
      )
      .stroke();

    // QR image
    doc.image(
      qrBuffer,
      677,
      402,
      {
        width: 101,
        height: 101,
      }
    );

    // QR label
    doc
      .font("Helvetica-Bold")
      .fontSize(7)
      .text(
        "SCAN TO VERIFY",
        677,
        510,
        {
          width: 101,
          align: "center",
        }
      );

    // ==========================================
    // SIGNATURE 1
    // ==========================================

    doc
      .moveTo(105, 495)
      .lineTo(255, 495)
      .lineWidth(1)
      .stroke();

    doc
      .font("Helvetica")
      .fontSize(9)
      .text(
        "Course Instructor",
        105,
        503,
        {
          width: 150,
          align: "center",
        }
      );

    // ==========================================
    // SIGNATURE 2
    // ==========================================

    doc
      .moveTo(380, 495)
      .lineTo(530, 495)
      .lineWidth(1)
      .stroke();

    doc
      .font("Helvetica")
      .fontSize(9)
      .text(
        "Authorized Signature",
        380,
        503,
        {
          width: 150,
          align: "center",
        }
      );

    // ==========================================
    // FOOTER
    // ==========================================

    doc
      .font("Helvetica")
      .fontSize(7)
      .text(
        "This certificate is issued upon successful completion of the stated course.",
        70,
        550,
        {
          width: 580,
          align: "center",
        }
      );

    // ==========================================
    // FINISH PDF
    // ==========================================

    doc.end();

  } catch (error) {
    console.error(
      "Certificate PDF Error:",
      error
    );

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
};