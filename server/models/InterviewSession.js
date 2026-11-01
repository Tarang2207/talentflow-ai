// server/models/InterviewSession.js
import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  category: { type: String, default: "General" },
  candidateAnswer: { type: String, default: "" },
  aiScore: { type: Number, default: 0 },
  feedback: { type: String, default: "" },
});

const interviewSessionSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
    },
    overallScore: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Not Started", "In Progress", "Completed"],
      default: "Completed",
    },
    recruiterStatus: {
      type: String,
      enum: ["Pending", "Shortlisted", "Rejected", "Hired"],
      default: "Pending",
    },
  },
  { timestamps: true },
);

export default mongoose.model("InterviewSession", interviewSessionSchema);
