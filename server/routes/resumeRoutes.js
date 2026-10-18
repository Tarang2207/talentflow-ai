// server/routes/resumeRoutes.js
import express from "express";
import multer from "multer";
import { uploadResume, getMyResume } from "../controllers/resumeController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Flexible middleware that captures any file field cleanly
const handleMulterUpload = (req, res, next) => {
  upload.any()(req, res, (err) => {
    if (err) {
      console.error("[MULTER ERROR]:", err.message);
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    }
    if (req.files && req.files.length > 0) {
      req.file = req.files[0];
    }
    next();
  });
};

router.post("/upload", protect, handleMulterUpload, uploadResume);
router.get("/my-resume", protect, getMyResume);

export default router;
