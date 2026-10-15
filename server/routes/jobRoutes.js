// server/routes/jobRoutes.js
import express from "express";
import { createJob, getJobs } from "../controllers/jobController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getJobs);
router.post("/", protect, authorizeRoles("Recruiter"), createJob);

export default router;
