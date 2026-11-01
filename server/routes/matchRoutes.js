import express from "express";
import {
  getJobResumeMatches,
  updateCandidateStatus,
} from "../controllers/matchController.js";

const router = express.Router();

router.get("/job-resumes/:jobId", getJobResumeMatches);
router.patch("/status/:id", updateCandidateStatus);

export default router;