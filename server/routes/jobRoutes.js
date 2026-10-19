// server/routes/jobRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createJob,
  getJobs,
  getJobById,
  updateJobQuestions, // <--- ADD THIS IMPORT
} from "../controllers/jobController.js";

const router = express.Router();

router.get("/", getJobs);
router.post("/", protect, createJob);
router.get("/:id", getJobById);
router.put("/:id", protect, updateJobQuestions);

export default router;
