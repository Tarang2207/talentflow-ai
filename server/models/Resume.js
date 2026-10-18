// server/models/Resume.js
import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    fileName: {
      type: String,
      default: 'resume.pdf'
    },
    rawText: {
      type: String,
      default: ''
    },
    extractedSkills: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
);

const Resume = mongoose.models.Resume || mongoose.model('Resume', resumeSchema);
export default Resume;