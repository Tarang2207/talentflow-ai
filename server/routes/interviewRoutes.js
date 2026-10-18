// server/routes/interviewRoutes.js
import express from "express";
import {
  generateInterview,
  submitInterviewAnswer,
} from "../controllers/interviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/generate", protect, generateInterview);
router.post("/submit", protect, submitInterviewAnswer);

export default router;
