// server/routes/interviewRoutes.js
import express from 'express';
import {
  generateInterviewSession,
  getInterviewSession,
  submitInterviewAnswers
} from '../controllers/interviewController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/generate', protect, authorizeRoles('Candidate'), generateInterviewSession);
router.get('/:id', protect, getInterviewSession);
router.post('/submit', protect, authorizeRoles('Candidate'), submitInterviewAnswers);

export default router;