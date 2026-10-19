// server/models/Job.js
import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a job title"],
      trim: true,
    },
    company: {
      type: String,
      required: [true, "Please provide a company name"],
    },
    description: {
      type: String,
      required: [true, "Please provide a job description"],
    },
    requiredSkills: [
      {
        type: String,
        trim: true,
      },
    ],
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Array storing 384-dimensional vector embedding for RAG search
    embedding: {
      type: [Number],
      default: [],
    },
    customQuestions: {
      type: [String],
      default: [
        "Explain the key differences between SQL and NoSQL databases in MERN applications.",
        "How do you manage global state using Zustand or Redux in React?",
        "What strategies do you use to optimize Express REST API endpoints?",
      ],
    },
  },
  { timestamps: true },
);

export default mongoose.model("Job", jobSchema);
