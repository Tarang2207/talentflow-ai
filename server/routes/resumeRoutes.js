// server/routes/resumeRoutes.js
import express from "express";
import multer from "multer";
import { protect } from "../middleware/authMiddleware.js";
import {
  uploadResume,
  getMyResume,
  getResumeById,
  getResumeFile,
} from "../controllers/resumeController.js";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

router.post("/upload", protect, upload.single("resume"), uploadResume);
router.get("/my-resume", protect, getMyResume);
router.get("/file/:id", getResumeFile);
router.get("/:id", protect, getResumeById);

export default router;
