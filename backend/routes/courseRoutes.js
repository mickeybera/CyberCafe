import express from "express";

import {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
} from "../controllers/courseController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createCourse);
router.get("/", getCourses);
router.get("/:id", getCourseById);
router.put("/:id", protect, updateCourse);
router.delete("/:id", protect, deleteCourse);

export default router;