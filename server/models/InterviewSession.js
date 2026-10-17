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
      required: false, // Allows demo/test sessions without throwing validation errors
    },
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      required: false, // Allows demo/test sessions without throwing validation errors
    },
    questions: [questionSchema],
    overallScore: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["In-Progress", "Completed"],
      default: "In-Progress",
    },
  },
  { timestamps: true },
);

export default mongoose.model("InterviewSession", interviewSessionSchema);
