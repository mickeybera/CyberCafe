import express from "express";

import {
  addPayment,
  getPayments,
  getStudentPayments,
  deletePayment,
} from "../controllers/paymentController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Add payment
router.post("/", protect, addPayment);

// Get all payments
router.get("/", protect, getPayments);

// Get payments of a particular student
router.get(
  "/student/:studentId",
  protect,
  getStudentPayments
);

// Delete payment
router.delete("/:id", protect, deletePayment);

export default router;