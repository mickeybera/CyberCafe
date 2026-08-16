import Notice from "../models/Notice.js";

// ==========================================
// CREATE NOTICE
// ==========================================

export const createNotice = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      startDate,
      lastDate,
      requiredDocuments,
      status,
      isPinned,
      isPublished,
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required",
      });
    }

    const notice = await Notice.create({
      title,
      description,
      category,
      startDate,
      lastDate,
      requiredDocuments,
      status,
      isPinned,
      isPublished,
    });

    res.status(201).json({
      success: true,
      message: "Notice created successfully",
      notice,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// GET ALL PUBLISHED NOTICES
// ==========================================

export const getNotices = async (req, res) => {
  try {
    const notices = await Notice.find({
      isPublished: true,
    }).sort({
      isPinned: -1,
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: notices.length,
      notices,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// GET ALL NOTICES FOR ADMIN
// ==========================================

export const getAllNoticesForAdmin = async (req, res) => {
  try {
    const notices = await Notice.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: notices.length,
      notices,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// GET SINGLE NOTICE
// ==========================================

export const getNoticeById = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: "Notice not found",
      });
    }

    res.status(200).json({
      success: true,
      notice,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// UPDATE NOTICE
// ==========================================

export const updateNotice = async (req, res) => {
  try {
    const notice = await Notice.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: "Notice not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notice updated successfully",
      notice,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// DELETE NOTICE
// ==========================================

export const deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findByIdAndDelete(req.params.id);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: "Notice not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notice deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};