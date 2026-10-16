// server/controllers/interviewController.js
import InterviewSession from "../models/InterviewSession.js";
import Job from "../models/Job.js";
import Resume from "../models/Resume.js";
import { generateInterviewQuestions } from "../utils/aiGenerator.js";

// @desc    Start/Generate AI Interview Session
// @route   POST /api/interviews/generate
export const generateInterviewSession = async (req, res) => {
  try {
    const { jobId, resumeId } = req.body;

    if (!jobId || !resumeId) {
      return res
        .status(400)
        .json({ message: "Please provide jobId and resumeId" });
    }

    const job = await Job.findById(jobId);
    const resume = await Resume.findById(resumeId);

    if (!job || !resume) {
      return res
        .status(404)
        .json({ message: "Job or Resume record not found" });
    }

    // Return existing session if candidate already started one for this job/resume pair
    let existingSession = await InterviewSession.findOne({
      candidate: req.user._id,
      job: jobId,
      resume: resumeId,
    });

    if (existingSession) {
      return res.status(200).json({
        message: "Retrieved existing active interview session",
        session: existingSession,
      });
    }

    // Generate custom questions using LLM
    const generatedQuestions = await generateInterviewQuestions(
      job.title,
      job.description,
      resume.rawText,
    );

    // Save session in MongoDB
    const session = await InterviewSession.create({
      candidate: req.user._id,
      job: jobId,
      resume: resumeId,
      questions: generatedQuestions,
      status: "In-Progress",
    });

    res.status(201).json({
      message: "AI screening interview generated successfully",
      session,
    });
  } catch (error) {
    console.error("Interview Generation Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Interview Session by ID
// @route   GET /api/interviews/:id
export const getInterviewSession = async (req, res) => {
  try {
    const session = await InterviewSession.findById(req.params.id)
      .populate("job", "title company description")
      .populate("resume", "fileName");

    if (!session) {
      return res.status(404).json({ message: "Interview session not found" });
    }

    res.status(200).json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
