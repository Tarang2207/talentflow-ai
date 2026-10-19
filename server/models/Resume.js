// server/models/Resume.js
import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    fileName: { type: String, default: "Resume.pdf" },
    filePath: { type: String },
    fileBuffer: { type: Buffer }, // Stores PDF binary buffer from Multer
    contentType: { type: String, default: "application/pdf" },
    rawText: { type: String },
    extractedSkills: { type: [String], default: [] },
  },
  { timestamps: true },
);

const Resume = mongoose.models.Resume || mongoose.model("Resume", resumeSchema);
export default Resume;
