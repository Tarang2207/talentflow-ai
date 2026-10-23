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

// GET resume by Candidate User ID (or Resume ID fallback)
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`\n--- [RESUME LOOKUP] Searching for ID: ${userId} ---`);

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log("❌ Invalid ObjectId format received.");
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const objectId = new mongoose.Types.ObjectId(userId);

    // 1. Direct match in Resume collection (User ID or Resume ID)
    let resume = await Resume.findOne({
      $or: [{ user: objectId }, { _id: objectId }],
    });

    if (resume) {
      console.log("✅ Resume found directly via User ID or Resume ID.");
      return res.status(200).json(resume);
    }

    // 2. Check all potential candidate/application collections in MongoDB
    if (mongoose.connection.db) {
      const db = mongoose.connection.db;

      // Check 'applications' collection
      let matchDoc = await db
        .collection("applications")
        .findOne({ _id: objectId });

      // Fallback: Check 'candidates' or 'users' collections if ID belongs to candidate profile
      if (!matchDoc) {
        matchDoc = await db.collection("candidates").findOne({ _id: objectId });
      }
      if (!matchDoc) {
        matchDoc = await db.collection("users").findOne({ _id: objectId });
      }

      if (matchDoc) {
        const candidateUserId =
          matchDoc.user ||
          matchDoc.applicant ||
          matchDoc.candidate ||
          matchDoc._id;
        console.log(
          `📌 Document found in DB. Resolved Candidate User ID: ${candidateUserId}`,
        );

        resume = await Resume.findOne({
          $or: [
            { user: new mongoose.Types.ObjectId(candidateUserId) },
            { _id: new mongoose.Types.ObjectId(candidateUserId) },
          ],
        });
      }
    }

    if (!resume) {
      console.log("❌ No matching resume document found in MongoDB.");
      return res
        .status(404)
        .json({ message: "No resume document found in database." });
    }

    console.log("✅ Resume found via reference fallback.");
    return res.status(200).json(resume);
  } catch (error) {
    console.error("🔥 [RESUME ROUTE ERROR]:", error);
    return res.status(500).json({ message: error.message });
  }
});

// 2. Generic ID lookup placed below
router.get("/:id", protect, getResumeById);

export default router;
