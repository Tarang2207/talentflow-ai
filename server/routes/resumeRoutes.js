// server/routes/resumeRoutes.js
import express from "express";
import multer from "multer";
import { uploadResume } from "../controllers/resumeController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Memory storage keeps files in RAM buffer rather than writing to disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF documents are allowed"), false);
    }
  },
});

router.post(
  "/upload",
  protect,
  authorizeRoles("Candidate"),
  upload.single("resume"),
  uploadResume,
);

export default router;
