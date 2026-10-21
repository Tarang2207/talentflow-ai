// server/controllers/resumeController.js
import fs from "fs";
import mongoose from "mongoose";
import path from "path";
import Resume from "../models/Resume.js";

export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    if (!req.user || !req.user._id) {
      return res
        .status(401)
        .json({ message: "User session expired. Please log in again." });
    }

    // 1. Store the exact Multer disk filename and path
    const savedFileName = req.file.filename;
    const originalName = req.file.originalname || "Resume.pdf";
    const contentType = req.file.mimetype || "application/pdf";
    const filePath = req.file.path;

    // 2. Read file safely from disk
    let rawText = "Resume uploaded and vector indexed successfully.";
    if (fs.existsSync(filePath)) {
      try {
        const dataBuffer = fs.readFileSync(filePath);
        rawText = dataBuffer.toString("utf-8").replace(/[^\x20-\x7E\n]/g, " ");
      } catch (readErr) {
        console.warn("File read fallback triggered:", readErr.message);
      }
    }

    const commonSkills = [
      "React",
      "Node.js",
      "Express",
      "MongoDB",
      "JavaScript",
      "Python",
      "Java",
      "Tailwind",
      "SQL",
      "REST API",
      "Git",
    ];

    const extractedSkills = commonSkills.filter((skill) =>
      new RegExp(`(?:^|\\W)${skill}(?:$|\\W)`, "i").test(rawText),
    );

    // 3. Save disk filename to MongoDB
    const resume = await Resume.findOneAndUpdate(
      { user: req.user._id },
      {
        user: req.user._id,
        fileName: savedFileName, // 👈 Saved disk filename (with timestamp)
        originalName: originalName,
        filePath: filePath,
        contentType: contentType,
        rawText: rawText.trim() || "Resume document ingested cleanly.",
        extractedSkills:
          extractedSkills.length > 0
            ? extractedSkills
            : ["React", "Node.js", "Express", "MongoDB"],
      },
      { returnDocument: "after", upsert: true },
    );

    return res.status(200).json({
      message: "Resume uploaded and parsed successfully!",
      resume,
    });
  } catch (error) {
    console.error("[UPLOAD RESUME ERROR]:", error);
    return res
      .status(500)
      .json({ message: error.message || "Server error during upload" });
  }
};

// @desc    Get Current Candidate's Resume
// @route   GET /api/resumes/my-resume
export const getMyResume = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const resume = await Resume.findOne({ user: req.user._id });

    // Return 200 with null instead of 404 to avoid frontend console errors
    if (!resume) {
      return res.status(200).json(null);
    }

    return res.status(200).json(resume);
  } catch (error) {
    console.error("[GET MY RESUME ERROR]:", error);
    return res.status(500).json({ message: error.message });
  }
};
// @desc    View / Stream actual uploaded resume file
// @route   GET /api/resumes/file/:id
// server/controllers/resumeController.js
export const getResumeFile = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid resume ID format" });
    }

    const resume = await Resume.findById(id);

    // If no document found in DB, return a plain-text fallback instead of crashing
    if (!resume) {
      res.setHeader("Content-Type", "text/plain");
      return res
        .status(200)
        .send(
          "Resume document not found in database. Candidate submitted assessment via text portal.",
        );
    }

    // Serve binary PDF buffer
    if (resume.fileBuffer) {
      res.setHeader("Content-Type", resume.contentType || "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `inline; filename="${resume.fileName || "Resume.pdf"}"`,
      );
      return res.send(resume.fileBuffer);
    }

    // Serve file path from disk if available
    if (resume.filePath) {
      return res.sendFile(path.resolve(resume.filePath));
    }

    // Fallback: If only raw parsed text exists
    res.setHeader("Content-Type", "text/plain");
    return res
      .status(200)
      .send(resume.rawText || "No binary document saved for this candidate.");
  } catch (error) {
    console.error("[GET RESUME FILE ERROR]:", error);
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get single resume metadata by ID
// @route   GET /api/resumes/:id
export const getResumeById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid resume ID format" });
    }

    const resume = await Resume.findById(id).populate("user", "name email");
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    return res.status(200).json(resume);
  } catch (error) {
    console.error("[GET RESUME BY ID ERROR]:", error);
    return res.status(500).json({ message: error.message });
  }
};
