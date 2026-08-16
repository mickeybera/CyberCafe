import express from "express";

import {
  generateCertificate,
  getCertificates,
  getCertificateById,
  verifyCertificate,
  revokeCertificate,
  downloadCertificatePDF,
} from "../controllers/certificateController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Public certificate verification
router.get(
  "/verify/:certificateNumber",
  verifyCertificate
);

// Generate certificate
router.post(
  "/",
  protect,
  generateCertificate
);

// Get all certificates
router.get(
  "/",
  protect,
  getCertificates
);

// Download certificate PDF
router.get(
  "/:id/pdf",
  protect,
  downloadCertificatePDF
);

// Get single certificate
router.get(
  "/:id",
  protect,
  getCertificateById
);

// Revoke certificate
router.put(
  "/:id/revoke",
  protect,
  revokeCertificate
);

export default router;