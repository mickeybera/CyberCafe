import express from "express";

import {
  createStudent,
  getStudents,
  searchStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} from "../controllers/studentController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// ==========================================
// CREATE STUDENT
// ==========================================

router.post(
  "/",
  protect,
  createStudent
);

// ==========================================
// GET ALL STUDENTS
// ==========================================

router.get(
  "/",
  protect,
  getStudents
);

// ==========================================
// SEARCH / FILTER STUDENTS
// ==========================================
// IMPORTANT:
// Keep this BEFORE /:id

router.get(
  "/search",
  protect,
  searchStudents
);

// ==========================================
// GET SINGLE STUDENT
// ==========================================

router.get(
  "/:id",
  protect,
  getStudentById
);

// ==========================================
// UPDATE STUDENT
// ==========================================

router.put(
  "/:id",
  protect,
  updateStudent
);

// ==========================================
// DELETE STUDENT
// ==========================================

router.delete(
  "/:id",
  protect,
  deleteStudent
);

export default router;