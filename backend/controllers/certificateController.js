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

    // Check course completion
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

    // Count certificates
    const count = await Certificate.countDocuments({
      category,
      certificateNumber: {
        $regex: `^${prefix}-${year}-`,
      },
    });

    // Certificate number
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

    // Populate student
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
    // FRONTEND URL
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
        width: 400,
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

    doc.pipe(res);

    // ==========================================
    // PAGE SIZE
    // ==========================================

    const pageWidth = 841.89;
    const pageHeight = 595.28;

    // ==========================================
    // COLORS
    // ==========================================

    const navy = "#12345B";
    const blue = "#1D4ED8";
    const lightBlue = "#EAF2FF";
    const gold = "#C9A227";
    const lightGold = "#F7E9B0";
    const dark = "#1F2937";
    const gray = "#64748B";

    // ==========================================
    // BACKGROUND
    // ==========================================

    doc
      .rect(
        0,
        0,
        pageWidth,
        pageHeight
      )
      .fill("#FFFFFF");

    // ==========================================
    // SUBTLE TOP DECORATION
    // ==========================================

    doc
      .save()
      .opacity(0.08)
      .circle(
        pageWidth / 2,
        110,
        180
      )
      .fill(blue)
      .restore();

    doc
      .save()
      .opacity(0.05)
      .circle(
        pageWidth / 2,
        pageHeight - 60,
        150
      )
      .fill(gold)
      .restore();

    // ==========================================
    // OUTER BORDER
    // ==========================================

    doc
      .lineWidth(7)
      .strokeColor(navy)
      .rect(
        16,
        16,
        pageWidth - 32,
        pageHeight - 32
      )
      .stroke();

    // ==========================================
    // GOLD BORDER
    // ==========================================

    doc
      .lineWidth(2)
      .strokeColor(gold)
      .rect(
        27,
        27,
        pageWidth - 54,
        pageHeight - 54
      )
      .stroke();

    // ==========================================
    // INNER BLUE BORDER
    // ==========================================

    doc
      .lineWidth(1)
      .strokeColor(blue)
      .rect(
        37,
        37,
        pageWidth - 74,
        pageHeight - 74
      )
      .stroke();

    // ==========================================
    // DECORATIVE CORNERS
    // ==========================================

    const cornerSize = 35;

    // TOP LEFT
    doc
      .lineWidth(3)
      .strokeColor(gold)
      .moveTo(40, 85)
      .lineTo(40, 40)
      .lineTo(85, 40)
      .stroke();

    // TOP RIGHT
    doc
      .moveTo(pageWidth - 40, 85)
      .lineTo(pageWidth - 40, 40)
      .lineTo(pageWidth - 85, 40)
      .stroke();

    // BOTTOM LEFT
    doc
      .moveTo(40, pageHeight - 85)
      .lineTo(40, pageHeight - 40)
      .lineTo(85, pageHeight - 40)
      .stroke();

    // BOTTOM RIGHT
    doc
      .moveTo(pageWidth - 40, pageHeight - 85)
      .lineTo(pageWidth - 40, pageHeight - 40)
      .lineTo(pageWidth - 85, pageHeight - 40)
      .stroke();

    // ==========================================
    // SMALL GOLD CORNER DIAMONDS
    // ==========================================

    const drawDiamond = (x, y, size) => {
      doc
        .save()
        .fillColor(gold)
        .moveTo(x, y - size)
        .lineTo(x + size, y)
        .lineTo(x, y + size)
        .lineTo(x - size, y)
        .closePath()
        .fill()
        .restore();
    };

    drawDiamond(40, 40, 5);
    drawDiamond(pageWidth - 40, 40, 5);
    drawDiamond(40, pageHeight - 40, 5);
    drawDiamond(
      pageWidth - 40,
      pageHeight - 40,
      5
    );

    // ==========================================
    // CENTER HEADER
    // ==========================================

    doc
      .fillColor(navy)
      .font("Helvetica-Bold")
      .fontSize(19)
      .text(
        centerName,
        80,
        52,
        {
          width: pageWidth - 160,
          align: "center",
        }
      );

    // ==========================================
    // ADDRESS
    // ==========================================

    doc
      .fillColor(gray)
      .font("Helvetica")
      .fontSize(9)
      .text(
        centerAddress,
        80,
        78,
        {
          width: pageWidth - 160,
          align: "center",
        }
      );

    // ==========================================
    // TRAINING TYPE
    // ==========================================

    doc
      .fillColor(blue)
      .font("Helvetica-Bold")
      .fontSize(8)
      .text(
        centerContact,
        80,
        93,
        {
          width: pageWidth - 160,
          align: "center",
        }
      );

    // ==========================================
    // GOLD DECORATIVE LINE
    // ==========================================

    doc
      .lineWidth(2)
      .strokeColor(gold)
      .moveTo(180, 113)
      .lineTo(662, 113)
      .stroke();

    doc
      .lineWidth(1)
      .strokeColor(lightGold)
      .moveTo(235, 118)
      .lineTo(607, 118)
      .stroke();

    // ==========================================
    // CERTIFICATE HEADING
    // ==========================================

    doc
      .fillColor(navy)
      .font("Helvetica-Bold")
      .fontSize(29)
      .text(
        "CERTIFICATE",
        70,
        132,
        {
          width: pageWidth - 140,
          align: "center",
        }
      );

    // ==========================================
    // OF COMPLETION
    // ==========================================

    doc
      .fillColor(gold)
      .font("Helvetica-Bold")
      .fontSize(12)
      .text(
        "OF COMPLETION",
        70,
        169,
        {
          width: pageWidth - 140,
          align: "center",
          characterSpacing: 2,
        }
      );

    // ==========================================
    // PRESENTED TO
    // ==========================================

    doc
      .fillColor(gray)
      .font("Helvetica")
      .fontSize(11)
      .text(
        "This certificate is proudly presented to",
        70,
        199,
        {
          width: pageWidth - 140,
          align: "center",
        }
      );

    // ==========================================
    // STUDENT NAME
    // ==========================================

    doc
      .fillColor(navy)
      .font("Helvetica-Bold")
      .fontSize(28)
      .text(
        certificate.studentName.toUpperCase(),
        80,
        222,
        {
          width: pageWidth - 160,
          align: "center",
        }
      );

    // ==========================================
    // NAME DECORATION
    // ==========================================

    doc
      .lineWidth(2)
      .strokeColor(gold)
      .moveTo(250, 260)
      .lineTo(591, 260)
      .stroke();

    doc
      .fillColor(gold)
      .circle(244, 260, 3)
      .fill();

    doc
      .fillColor(gold)
      .circle(597, 260, 3)
      .fill();

    // ==========================================
    // COURSE INTRODUCTION
    // ==========================================

    doc
      .fillColor(gray)
      .font("Helvetica")
      .fontSize(10.5)
      .text(
        "for successfully completing the",
        70,
        277,
        {
          width: pageWidth - 140,
          align: "center",
        }
      );

    // ==========================================
    // COURSE NAME BACKGROUND
    // ==========================================

    doc
      .save()
      .fillColor(lightBlue)
      .roundedRect(
        170,
        300,
        502,
        43,
        10
      )
      .fill()
      .restore();

    // ==========================================
    // COURSE NAME
    // ==========================================

    doc
      .fillColor(navy)
      .font("Helvetica-Bold")
      .fontSize(18)
      .text(
        certificate.courseName.toUpperCase(),
        185,
        313,
        {
          width: 472,
          align: "center",
        }
      );

    // ==========================================
    // DURATION
    // ==========================================

    doc
      .fillColor(gray)
      .font("Helvetica")
      .fontSize(9.5)
      .text(
        `Course Duration: ${certificate.duration}`,
        70,
        355,
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
    // INFORMATION STRIP
    // ==========================================

    doc
      .save()
      .fillColor("#F8FAFC")
      .roundedRect(
        65,
        388,
        550,
        65,
        8
      )
      .fill()
      .restore();

    doc
      .lineWidth(1)
      .strokeColor("#E2E8F0")
      .roundedRect(
        65,
        388,
        550,
        65,
        8
      )
      .stroke();

    // ==========================================
    // CERTIFICATE NUMBER
    // ==========================================

    doc
      .fillColor(gray)
      .font("Helvetica-Bold")
      .fontSize(7)
      .text(
        "CERTIFICATE NUMBER",
        82,
        402
      );

    doc
      .fillColor(dark)
      .font("Helvetica-Bold")
      .fontSize(9)
      .text(
        certificate.certificateNumber,
        82,
        417
      );

    // ==========================================
    // COMPLETION DATE
    // ==========================================

    doc
      .fillColor(gray)
      .font("Helvetica-Bold")
      .fontSize(7)
      .text(
        "COMPLETION DATE",
        285,
        402
      );

    doc
      .fillColor(dark)
      .font("Helvetica-Bold")
      .fontSize(9)
      .text(
        completionDate,
        285,
        417
      );

    // ==========================================
    // ISSUE DATE
    // ==========================================

    doc
      .fillColor(gray)
      .font("Helvetica-Bold")
      .fontSize(7)
      .text(
        "ISSUE DATE",
        450,
        402
      );

    doc
      .fillColor(dark)
      .font("Helvetica-Bold")
      .fontSize(9)
      .text(
        issueDate,
        450,
        417
      );

    // ==========================================
    // QR CODE AREA
    // ==========================================

    doc
      .save()
      .fillColor("#FFFFFF")
      .roundedRect(
        650,
        372,
        135,
        145,
        10
      )
      .fill()
      .restore();

    doc
      .lineWidth(2)
      .strokeColor(gold)
      .roundedRect(
        650,
        372,
        135,
        145,
        10
      )
      .stroke();

    // ==========================================
    // QR CODE
    // ==========================================

    doc.image(
      qrBuffer,
      669,
      390,
      {
        width: 97,
        height: 97,
      }
    );

    // ==========================================
    // QR LABEL
    // ==========================================

    doc
      .fillColor(navy)
      .font("Helvetica-Bold")
      .fontSize(7.5)
      .text(
        "SCAN TO VERIFY",
        660,
        493,
        {
          width: 115,
          align: "center",
        }
      );

    doc
      .fillColor(gray)
      .font("Helvetica")
      .fontSize(6.5)
      .text(
        "Digital Verification",
        660,
        504,
        {
          width: 115,
          align: "center",
        }
      );

    // ==========================================
    // SIGNATURE AREA
    // ==========================================

    // Left signature
    doc
      .lineWidth(1)
      .strokeColor(navy)
      .moveTo(95, 493)
      .lineTo(245, 493)
      .stroke();

    doc
      .fillColor(dark)
      .font("Helvetica-Bold")
      .fontSize(8.5)
      .text(
        "Course Instructor",
        95,
        501,
        {
          width: 150,
          align: "center",
        }
      );

    // Right signature
    doc
      .lineWidth(1)
      .strokeColor(navy)
      .moveTo(370, 493)
      .lineTo(520, 493)
      .stroke();

    doc
      .fillColor(dark)
      .font("Helvetica-Bold")
      .fontSize(8.5)
      .text(
        "Authorized Signature",
        370,
        501,
        {
          width: 150,
          align: "center",
        }
      );

    // ==========================================
    // SMALL GOLD SEPARATORS
    // ==========================================

    doc
      .fillColor(gold)
      .circle(320, 493, 3)
      .fill();

    doc
      .fillColor(gold)
      .circle(350, 493, 3)
      .fill();

    // ==========================================
    // FOOTER
    // ==========================================

    doc
      .fillColor(gray)
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
    // VERIFICATION TEXT
    // ==========================================

    doc
      .fillColor(blue)
      .font("Helvetica-Bold")
      .fontSize(6.5)
      .text(
        "Verify authenticity by scanning the QR code",
        635,
        535,
        {
          width: 160,
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