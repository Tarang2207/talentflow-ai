// server/routes/matchRoutes.js
import express from 'express';
import { getJobResumeMatches } from '../controllers/matchController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/job-resumes/:jobId', protect, getJobResumeMatches);

export default router;