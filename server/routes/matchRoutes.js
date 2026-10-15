// server/routes/matchRoutes.js
import express from "express";
import { matchResumesForJob } from "../controllers/matchController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/job-resumes/:jobId",
  protect,
  authorizeRoles("Recruiter"),
  matchResumesForJob,
);

export default router;
