
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

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required",
      });
    }

    const student = await Student.findById(studentId).populate("course");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    if (!student.course) {
      return res.status(400).json({
        success: false,
        message: "Student does not have a course",
      });
    }

    if (student.status !== "completed") {
      return res.status(400).json({
        success: false,
        message:
          "Student must complete the course before generating a certificate",
      });
    }

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

    const category = student.course.category;

    const prefix =
      category === "computer"
        ? "CTC-COMP"
        : "CTC-TAIL";

    const year = new Date().getFullYear();

    const count = await Certificate.countDocuments({
      category,
      certificateNumber: {
        $regex: `^${prefix}-${year}-`,
      },
    });

    const certificateNumber = `${prefix}-${year}-${String(
      count + 1
    ).padStart(5, "0")}`;

    const certificate = await Certificate.create({
      student: student._id,
      certificateNumber,
      studentName: student.name,
      courseName: student.course.name,
      category: student.course.category,
      duration: student.course.duration,
      completionDate: completionDate || new Date(),
    });

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

    // ==========================================
    // REVOKED CERTIFICATE CHECK
    // ==========================================

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
    // FRONTEND URL CHECK
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
        width: 500,
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
    // COLOR PALETTE
    // ==========================================

    const navy = "#102A43";
    const darkNavy = "#0B1F33";
    const royalBlue = "#2563EB";
    const blue = "#3B82F6";
    const paleBlue = "#EAF3FF";

    const gold = "#C79A25";
    const darkGold = "#9A7416";
    const paleGold = "#F8EEC8";

    const cream = "#FCFAF3";
    const white = "#FFFFFF";

    const darkText = "#243447";
    const gray = "#64748B";
    const lightGray = "#CBD5E1";

    // ==========================================
    // BACKGROUND
    // ==========================================

    // Main cream paper
    doc
      .rect(
        0,
        0,
        pageWidth,
        pageHeight
      )
      .fill(cream);

    // ==========================================
    // BACKGROUND DESIGN - TOP BLUE SHAPE
    // ==========================================

    doc
      .save()
      .opacity(0.08)
      .fillColor(royalBlue)
      .moveTo(0, 0)
      .lineTo(330, 0)
      .lineTo(0, 205)
      .closePath()
      .fill()
      .restore();

    // ==========================================
    // BACKGROUND DESIGN - TOP GOLD SHAPE
    // ==========================================

    doc
      .save()
      .opacity(0.10)
      .fillColor(gold)
      .moveTo(0, 0)
      .lineTo(190, 0)
      .lineTo(0, 120)
      .closePath()
      .fill()
      .restore();

    // ==========================================
    // BACKGROUND DESIGN - BOTTOM BLUE SHAPE
    // ==========================================

    doc
      .save()
      .opacity(0.07)
      .fillColor(royalBlue)
      .moveTo(pageWidth, pageHeight)
      .lineTo(pageWidth - 350, pageHeight)
      .lineTo(pageWidth, pageHeight - 210)
      .closePath()
      .fill()
      .restore();

    // ==========================================
    // BACKGROUND DESIGN - BOTTOM GOLD SHAPE
    // ==========================================

    doc
      .save()
      .opacity(0.08)
      .fillColor(gold)
      .moveTo(pageWidth, pageHeight)
      .lineTo(pageWidth - 200, pageHeight)
      .lineTo(pageWidth, pageHeight - 125)
      .closePath()
      .fill()
      .restore();

    // ==========================================
    // LARGE WATERMARK CIRCLE
    // ==========================================

    doc
      .save()
      .opacity(0.045)
      .lineWidth(12)
      .strokeColor(royalBlue)
      .circle(
        pageWidth / 2,
        292,
        155
      )
      .stroke()
      .restore();

    doc
      .save()
      .opacity(0.035)
      .lineWidth(3)
      .strokeColor(gold)
      .circle(
        pageWidth / 2,
        292,
        137
      )
      .stroke()
      .restore();

    // ==========================================
    // WATERMARK STAR / SEAL
    // ==========================================

    const drawStar = (
      centerX,
      centerY,
      outerRadius,
      innerRadius,
      points
    ) => {
      const path = [];

      for (let i = 0; i < points * 2; i++) {
        const angle =
          -Math.PI / 2 +
          (i * Math.PI) / points;

        const radius =
          i % 2 === 0
            ? outerRadius
            : innerRadius;

        path.push({
          x:
            centerX +
            Math.cos(angle) * radius,
          y:
            centerY +
            Math.sin(angle) * radius,
        });
      }

      doc
        .save()
        .moveTo(path[0].x, path[0].y);

      for (let i = 1; i < path.length; i++) {
        doc.lineTo(
          path[i].x,
          path[i].y
        );
      }

      doc
        .closePath()
        .fillColor(royalBlue)
        .fill()
        .restore();
    };

    doc
      .save()
      .opacity(0.025);

    drawStar(
      pageWidth / 2,
      292,
      105,
      78,
      16
    );

    doc.restore();

    // ==========================================
    // OUTER NAVY BORDER
    // ==========================================

    doc
      .lineWidth(8)
      .strokeColor(navy)
      .rect(
        15,
        15,
        pageWidth - 30,
        pageHeight - 30
      )
      .stroke();

    // ==========================================
    // GOLD BORDER
    // ==========================================

    doc
      .lineWidth(2.5)
      .strokeColor(gold)
      .rect(
        28,
        28,
        pageWidth - 56,
        pageHeight - 56
      )
      .stroke();

    // ==========================================
    // INNER BLUE BORDER
    // ==========================================

    doc
      .lineWidth(1)
      .strokeColor(royalBlue)
      .rect(
        38,
        38,
        pageWidth - 76,
        pageHeight - 76
      )
      .stroke();

    // ==========================================
    // DECORATIVE CORNER FUNCTION
    // ==========================================

    const drawCorner = (
      x,
      y,
      horizontal,
      vertical
    ) => {
      doc
        .save()
        .lineWidth(2.5)
        .strokeColor(gold)
        .moveTo(x, y + vertical * 48)
        .lineTo(x, y)
        .lineTo(x + horizontal * 48, y)
        .stroke()
        .restore();

      doc
        .save()
        .lineWidth(1)
        .strokeColor(royalBlue)
        .moveTo(
          x + horizontal * 7,
          y + vertical * 40
        )
        .lineTo(
          x + horizontal * 7,
          y + vertical * 7
        )
        .lineTo(
          x + horizontal * 40,
          y + vertical * 7
        )
        .stroke()
        .restore();
    };

    // Corners
    drawCorner(40, 40, 1, 1);
    drawCorner(
      pageWidth - 40,
      40,
      -1,
      1
    );
    drawCorner(
      40,
      pageHeight - 40,
      1,
      -1
    );
    drawCorner(
      pageWidth - 40,
      pageHeight - 40,
      -1,
      -1
    );

    // ==========================================
    // DECORATIVE CORNER DIAMONDS
    // ==========================================

    const drawDiamond = (
      x,
      y,
      size
    ) => {
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
    drawDiamond(
      pageWidth - 40,
      40,
      5
    );
    drawDiamond(
      40,
      pageHeight - 40,
      5
    );
    drawDiamond(
      pageWidth - 40,
      pageHeight - 40,
      5
    );

    // ==========================================
    // HEADER WHITE PANEL
    // ==========================================

    doc
      .save()
      .fillColor(white)
      .opacity(0.88)
      .roundedRect(
        105,
        48,
        632,
        72,
        18
      )
      .fill()
      .restore();

    // ==========================================
    // CENTER NAME
    // ==========================================

    doc
      .fillColor(navy)
      .font("Helvetica-Bold")
      .fontSize(19)
      .text(
        centerName,
        115,
        57,
        {
          width: 612,
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
        115,
        82,
        {
          width: 612,
          align: "center",
        }
      );

    // ==========================================
    // CENTER CONTACT
    // ==========================================

    doc
      .fillColor(royalBlue)
      .font("Helvetica-Bold")
      .fontSize(8)
      .text(
        centerContact,
        115,
        97,
        {
          width: 612,
          align: "center",
        }
      );

    // ==========================================
    // DECORATIVE HEADER LINE
    // ==========================================

    doc
      .lineWidth(2)
      .strokeColor(gold)
      .moveTo(195, 125)
      .lineTo(646, 125)
      .stroke();

    doc
      .fillColor(gold)
      .circle(190, 125, 3)
      .fill();

    doc
      .fillColor(gold)
      .circle(651, 125, 3)
      .fill();

    // ==========================================
    // CERTIFICATE TITLE
    // ==========================================

    doc
      .fillColor(navy)
      .font("Helvetica-Bold")
      .fontSize(30)
      .text(
        "CERTIFICATE",
        70,
        140,
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
        178,
        {
          width: pageWidth - 140,
          align: "center",
          characterSpacing: 2,
        }
      );

    // ==========================================
    // PRESENTED TEXT
    // ==========================================

    doc
      .fillColor(gray)
      .font("Helvetica")
      .fontSize(11)
      .text(
        "This certificate is proudly presented to",
        70,
        208,
        {
          width: pageWidth - 140,
          align: "center",
        }
      );

    // ==========================================
    // STUDENT NAME
    // ==========================================

    doc
      .fillColor(darkNavy)
      .font("Helvetica-Bold")
      .fontSize(29)
      .text(
        certificate.studentName.toUpperCase(),
        80,
        231,
        {
          width: pageWidth - 160,
          align: "center",
        }
      );

    // ==========================================
    // STUDENT NAME ORNAMENT
    // ==========================================

    doc
      .lineWidth(2)
      .strokeColor(gold)
      .moveTo(245, 269)
      .lineTo(597, 269)
      .stroke();

    doc
      .fillColor(gold)
      .circle(238, 269, 3)
      .fill();

    doc
      .fillColor(gold)
      .circle(604, 269, 3)
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
        285,
        {
          width: pageWidth - 140,
          align: "center",
        }
      );

    // ==========================================
    // COURSE PANEL
    // ==========================================

    doc
      .save()
      .fillColor(paleBlue)
      .roundedRect(
        155,
        307,
        532,
        45,
        12
      )
      .fill()
      .restore();

    doc
      .lineWidth(1.5)
      .strokeColor(royalBlue)
      .roundedRect(
        155,
        307,
        532,
        45,
        12
      )
      .stroke();

    // Gold course accent
    doc
      .fillColor(gold)
      .roundedRect(
        155,
        307,
        7,
        45,
        4
      )
      .fill();

    doc
      .fillColor(navy)
      .font("Helvetica-Bold")
      .fontSize(18)
      .text(
        certificate.courseName.toUpperCase(),
        175,
        319,
        {
          width: 492,
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
        361,
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
    // INFORMATION CARD
    // ==========================================

    doc
      .save()
      .fillColor(white)
      .opacity(0.94)
      .roundedRect(
        65,
        390,
        555,
        63,
        10
      )
      .fill()
      .restore();

    doc
      .lineWidth(1)
      .strokeColor(lightGray)
      .roundedRect(
        65,
        390,
        555,
        63,
        10
      )
      .stroke();

    // Gold top line
    doc
      .lineWidth(2)
      .strokeColor(gold)
      .moveTo(85, 390)
      .lineTo(600, 390)
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
        83,
        404
      );

    doc
      .fillColor(darkText)
      .font("Helvetica-Bold")
      .fontSize(9)
      .text(
        certificate.certificateNumber,
        83,
        418
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
        404
      );

    doc
      .fillColor(darkText)
      .font("Helvetica-Bold")
      .fontSize(9)
      .text(
        completionDate,
        285,
        418
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
        460,
        404
      );

    doc
      .fillColor(darkText)
      .font("Helvetica-Bold")
      .fontSize(9)
      .text(
        issueDate,
        460,
        418
      );

    // ==========================================
    // QR VERIFICATION CARD
    // ==========================================

    doc
      .save()
      .fillColor(white)
      .opacity(0.97)
      .roundedRect(
        650,
        370,
        137,
        149,
        12
      )
      .fill()
      .restore();

    doc
      .lineWidth(2)
      .strokeColor(gold)
      .roundedRect(
        650,
        370,
        137,
        149,
        12
      )
      .stroke();

    // QR blue top strip
    doc
      .fillColor(navy)
      .roundedRect(
        650,
        370,
        137,
        27,
        12
      )
      .fill();

    // Cover lower part of rounded strip
    doc
      .fillColor(navy)
      .rect(
        650,
        384,
        137,
        13
      )
      .fill();

    doc
      .fillColor(white)
      .font("Helvetica-Bold")
      .fontSize(7)
      .text(
        "CERTIFICATE VERIFICATION",
        655,
        379,
        {
          width: 127,
          align: "center",
        }
      );

    // ==========================================
    // QR CODE
    // ==========================================

    doc.image(
      qrBuffer,
      670,
      402,
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
      .fontSize(7)
      .text(
        "SCAN TO VERIFY",
        660,
        501,
        {
          width: 117,
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
        511,
        {
          width: 117,
          align: "center",
        }
      );

    // ==========================================
    // SIGNATURE SECTION
    // ==========================================

    // Left signature
    doc
      .lineWidth(1)
      .strokeColor(navy)
      .moveTo(95, 495)
      .lineTo(245, 495)
      .stroke();

    doc
      .fillColor(darkText)
      .font("Helvetica-Bold")
      .fontSize(8.5)
      .text(
        "Course Instructor",
        95,
        502,
        {
          width: 150,
          align: "center",
        }
      );

    // Right signature
    doc
      .lineWidth(1)
      .strokeColor(navy)
      .moveTo(370, 495)
      .lineTo(520, 495)
      .stroke();

    doc
      .fillColor(darkText)
      .font("Helvetica-Bold")
      .fontSize(8.5)
      .text(
        "Authorized Signature",
        370,
        502,
        {
          width: 150,
          align: "center",
        }
      );

    // ==========================================
    // GOLD SEAL
    // ==========================================

    doc
      .save()
      .fillColor(gold)
      .circle(307, 493, 25)
      .fill()
      .restore();

    doc
      .save()
      .fillColor(cream)
      .circle(307, 493, 19)
      .fill()
      .restore();

    doc
      .fillColor(gold)
      .font("Helvetica-Bold")
      .fontSize(6.5)
      .text(
        "CERTIFIED",
        287,
        489,
        {
          width: 40,
          align: "center",
        }
      );

    doc
      .fillColor(gold)
      .font("Helvetica-Bold")
      .fontSize(5)
      .text(
        "TRAINING",
        287,
        497,
        {
          width: 40,
          align: "center",
        }
      );

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
        551,
        {
          width: 580,
          align: "center",
        }
      );

    // ==========================================
    // VERIFICATION FOOTER
    // ==========================================

    doc
      .fillColor(royalBlue)
      .font("Helvetica-Bold")
      .fontSize(6.5)
      .text(
        "Scan the QR code to verify certificate authenticity",
        635,
        540,
        {
          width: 165,
          align: "center",
        }
      );

    // ==========================================
    // FINALIZE PDF
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

