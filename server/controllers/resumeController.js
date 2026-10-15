// server/controllers/resumeController.js
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

import Resume from "../models/Resume.js";
import { generateEmbedding } from "../utils/embedding.js";

export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a PDF file" });
    }

    // 1. Extract text from PDF buffer
    const pdfData = await pdfParse(req.file.buffer);
    const extractedText = pdfData.text;

    if (!extractedText || extractedText.trim().length === 0) {
      return res
        .status(400)
        .json({ message: "Could not extract text from PDF" });
    }

    // 2. Generate vector embedding locally ($0 cost)
    const embeddingVector = await generateEmbedding(extractedText);

    // 3. Save Resume record to MongoDB
    const resume = await Resume.create({
      candidate: req.user._id,
      fileName: req.file.originalname,
      rawText: extractedText,
      embedding: embeddingVector,
    });

    res.status(201).json({
      message: "Resume parsed and vector indexed successfully",
      resumeId: resume._id,
      fileName: resume.fileName,
      vectorLength: resume.embedding.length, // 384 dimensions
    });
  } catch (error) {
    console.error("Resume Processing Error:", error);
    res.status(500).json({ message: error.message });
  }
};
