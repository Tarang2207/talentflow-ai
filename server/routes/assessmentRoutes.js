import express from "express";
import {
  getAssessmentQuestions,
  submitAssessment,
} from "../controllers/assessmentController.js";

const router = express.Router();

router.get("/questions/:jobId", getAssessmentQuestions);
router.post("/submit", submitAssessment);

export default router;
