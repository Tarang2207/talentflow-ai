// server/routes/resumeRoutes.js
import express from "express";
import mongoose from "mongoose";
import Resume from "../models/Resume.js";
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
// server/routes/resumeRoutes.js

// GET candidate resume by User ID, Application ID, or Resume ID
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const targetId = new mongoose.Types.ObjectId(userId);

    // 1. Direct Lookup by user ID or resume _id
    let resume = await Resume.findOne({
      $or: [{ user: targetId }, { _id: targetId }],
    });

    // 2. Fallback: Search applications or candidates collections if targetId is an Application/Candidate ID
    if (!resume && mongoose.connection.db) {
      const db = mongoose.connection.db;

      // Check 'applications' collection
      const appDoc = await db
        .collection("applications")
        .findOne({ _id: targetId });
      let candidateUserId =
        appDoc?.user || appDoc?.candidate || appDoc?.applicant;

      // Check 'candidates' collection
      if (!candidateUserId) {
        const candDoc = await db
          .collection("candidates")
          .findOne({ _id: targetId });
        candidateUserId = candDoc?.user || candDoc?.userId;
      }

      if (candidateUserId) {
        const cleanUserId = new mongoose.Types.ObjectId(candidateUserId);
        resume = await Resume.findOne({
          $or: [{ user: cleanUserId }, { _id: cleanUserId }],
        });
      }
    }

    if (!resume) {
      return res
        .status(404)
        .json({ message: "No resume found for this candidate ID" });
    }

    return res.status(200).json(resume);
  } catch (error) {
    console.error("[GET USER RESUME ROUTE ERROR]:", error);
    return res.status(500).json({ message: error.message });
  }
});

// 2. Generic ID lookup placed below
router.get("/:id", protect, getResumeById);

export default router;
