// server/controllers/interviewController.js
import InterviewSession from "../models/InterviewSession.js";
import Job from "../models/Job.js";
import mongoose from "mongoose";

export const generateInterview = async (req, res) => {
  try {
    const { jobId, forceRetake } = req.body;
    const candidateId = req.user._id;

    const query = { candidate: candidateId };
    if (jobId && mongoose.Types.ObjectId.isValid(jobId)) {
      query.job = jobId;
    }

    const existingSession = await InterviewSession.findOne(query).sort({
      updatedAt: -1,
    });

    if (
      !forceRetake &&
      existingSession &&
      (existingSession.status === "Completed" ||
        existingSession.overallScore > 0)
    ) {
      return res.status(200).json({
        sessionId: existingSession._id,
        isCompleted: true,
        status: "Completed",
        overallScore: existingSession.overallScore || 85,
        questions: existingSession.questions,
      });
    }

    let session = existingSession;
    if (forceRetake || !session || session.status === "Completed") {
      session = await InterviewSession.create({
        candidate: candidateId,
        job: mongoose.Types.ObjectId.isValid(jobId) ? jobId : null,
        status: "In-Progress",
        questions: [
          {
            question:
              "Explain how you structure REST APIs in Express and handle async errors.",
            category: "Backend",
          },
          {
            question:
              "How do React hooks handle re-renders and memory optimization?",
            category: "Frontend",
          },
          {
            question:
              "Explain MongoDB indexing strategies and vector search concepts.",
            category: "Database",
          },
        ],
      });
    }

    res.status(200).json({
      sessionId: session._id,
      isCompleted: false,
      status: session.status,
      questions: session.questions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const submitInterviewAnswer = async (req, res) => {
  try {
    const { sessionId, questionIndex, answer } = req.body;
    const score = Math.floor(Math.random() * 12) + 84;

    if (sessionId && mongoose.Types.ObjectId.isValid(sessionId)) {
      const session = await InterviewSession.findById(sessionId);
      if (session) {
        session.responses = session.responses || [];
        session.responses.push({ questionIndex, answer, score });

        if (questionIndex >= (session.questions?.length || 3) - 1) {
          session.status = "Completed";
          session.overallScore = score;
        }
        await session.save();
      }
    }

    res.status(200).json({
      score,
      feedback: "Clear technical concepts explained well.",
      strengths: ["Good communication", "Relevant technical terms"],
      improvements: ["Can include code snippets"],
      isCompleted: true,
      overallScore: score,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Aliases to prevent ESM import mismatch crashes
export const generateInterviewSession = generateInterview;
export const submitAnswer = submitInterviewAnswer;
