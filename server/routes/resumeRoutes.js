// server/routes/resumeRoutes.js
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { protect } from "../middleware/authMiddleware.js";
import {
  uploadResume,
  getMyResume,
  getResumeById,
  getResumeFile,
} from "../controllers/resumeController.js";

// Ensure 'uploads' directory exists
const uploadDir = path.resolve("uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure disk storage so PDFs save to server/uploads/
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniquePrefix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const cleanOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    cb(null, `${uniquePrefix}-${cleanOriginalName}`);
  },
});

const upload = multer({ storage });
const router = express.Router();

// Clean route definitions pointing to controller logic
router.post("/upload", protect, upload.single("resume"), uploadResume);
router.get("/my-resume", protect, getMyResume);
router.get("/file/:id", getResumeFile);
router.get("/:id", protect, getResumeById);

export default router;
