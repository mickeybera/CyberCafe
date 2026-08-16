import express from "express";

import {
  createNotice,
  getNotices,
  getAllNoticesForAdmin,
  getNoticeById,
  updateNotice,
  deleteNotice,
} from "../controllers/noticeController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getNotices);
router.get("/:id", getNoticeById);

// Admin routes
router.get("/admin/all", protect, getAllNoticesForAdmin);
router.post("/", protect, createNotice);
router.put("/:id", protect, updateNotice);
router.delete("/:id", protect, deleteNotice);

export default router;