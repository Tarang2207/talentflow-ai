// server/controllers/interviewController.js
import InterviewSession from "../models/InterviewSession.js";
import Job from "../models/Job.js";
import Resume from "../models/Resume.js";
import {
  generateInterviewQuestions,
  evaluateCandidateAnswers,
} from "../utils/aiGenerator.js";
import mongoose from "mongoose";

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

    let jobTitle = "Full Stack MERN Developer";
    let jobDescription =
      "Looking for a developer with Node.js, Express, React, and MongoDB experience.";
    let resumeText =
      "Experienced Full Stack MERN developer skilled in JavaScript, Node.js, Express, React, MongoDB, and Tailwind CSS.";

    // Safely query Job if valid ObjectId
    if (mongoose.Types.ObjectId.isValid(jobId)) {
      const job = await Job.findById(jobId);
      if (job) {
        jobTitle = job.title;
        jobDescription = job.description;
      }
    }

    // Safely query Resume if valid ObjectId
    if (mongoose.Types.ObjectId.isValid(resumeId)) {
      const resume = await Resume.findById(resumeId);
      if (resume) {
        resumeText = resume.rawText;
      }
    }

    // Check for an active existing session
    const query = { candidate: req.user._id };
    if (mongoose.Types.ObjectId.isValid(jobId)) {
      query.job = jobId;
    }

    let existingSession = await InterviewSession.findOne(query);

    if (existingSession) {
      return res.status(200).json({
        message: "Retrieved existing active interview session",
        session: existingSession,
      });
    }

    const generatedQuestions = await generateInterviewQuestions(
      jobTitle,
      jobDescription,
      resumeText,
    );

    const sessionData = {
      candidate: req.user._id,
      questions: generatedQuestions,
      status: "In-Progress",
    };

    if (mongoose.Types.ObjectId.isValid(jobId)) sessionData.job = jobId;
    if (mongoose.Types.ObjectId.isValid(resumeId))
      sessionData.resume = resumeId;

    const session = await InterviewSession.create(sessionData);

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

// @desc    Submit candidate answers & run AI grading evaluation
// @route   POST /api/interviews/submit
export const submitInterviewAnswers = async (req, res) => {
  try {
    const { sessionId, answers } = req.body;

    const session = await InterviewSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Interview session not found" });
    }

    let totalScore = 0;

    for (let item of answers) {
      const questionObj = session.questions.id(item.questionId);
      if (questionObj) {
        questionObj.candidateAnswer = item.candidateAnswer;

        const evaluation = await evaluateCandidateAnswers(
          questionObj.question,
          item.candidateAnswer,
        );

        questionObj.aiScore = evaluation.aiScore;
        questionObj.feedback = evaluation.feedback;
        totalScore += evaluation.aiScore;
      }
    }

    session.overallScore = Math.round(totalScore / session.questions.length);
    session.status = "Completed";

    await session.save();

    res.status(200).json({
      message: "Interview submitted and evaluated successfully",
      session,
    });
  } catch (error) {
    console.error("Interview Submission Error:", error);
    res.status(500).json({ message: error.message });
  }
};
