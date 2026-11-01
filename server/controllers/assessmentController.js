import Job from "../models/Job.js";
import InterviewSession from "../models/InterviewSession.js";
import { evaluateAssessmentWithAI } from "../services/aiService.js";

// Fetch assessment questions for a job
export const getAssessmentQuestions = async (req, res) => {
  try {
    const { jobId } = req.params;
    let job = null;

    if (jobId && jobId !== "default-job") {
      job = await Job.findById(jobId);
    }

    const questions = job?.customQuestions?.length
      ? job.customQuestions
      : [
          "Explain the key differences between SQL and NoSQL databases in MERN applications.",
          "How do you manage global state using Zustand or Redux in React?",
          "What strategies do you use to optimize Express REST API endpoints?",
        ];

    return res.status(200).json({
      jobId: job?._id || "default-job",
      jobTitle: job?.title || "Full Stack MERN Developer",
      questions,
    });
  } catch (error) {
    console.error("[GET QUESTIONS ERROR]:", error);
    return res.status(500).json({ message: error.message });
  }
};

// Submit assessment & create/update InterviewSession
export const submitAssessment = async (req, res) => {
  try {
    const { jobId, candidateId, QnA } = req.body;

    if (!candidateId || !Array.isArray(QnA)) {
      return res
        .status(400)
        .json({
          message: "Candidate ID and assessment QnA array are required.",
        });
    }

    let activeJob = null;
    if (jobId && jobId !== "default-job") {
      activeJob = await Job.findById(jobId);
    }

    const jobTitle = activeJob?.title || "Full Stack Engineer";
    const jobDescription = activeJob?.description || "";

    // Run AI Evaluation
    const evalResult = await evaluateAssessmentWithAI(
      jobTitle,
      jobDescription,
      QnA,
    );

    // Create or Update InterviewSession record in MongoDB
    let session = await InterviewSession.findOne({
      candidate: candidateId,
      job: activeJob?._id,
    });

    if (!session) {
      session = new InterviewSession({
        candidate: candidateId,
        job: activeJob?._id || null,
        overallScore: evalResult.overallScore,
        status: "Completed",
        recruiterStatus: "Pending",
      });
    } else {
      session.overallScore = evalResult.overallScore;
      session.status = "Completed";
    }

    await session.save();

    return res.status(200).json({
      message: "Assessment submitted and evaluated successfully!",
      session,
      evaluation: evalResult,
    });
  } catch (error) {
    console.error("[SUBMIT ASSESSMENT ERROR]:", error);
    return res.status(500).json({ message: error.message });
  }
};
