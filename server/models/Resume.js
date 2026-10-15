// server/models/Resume.js
import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    rawText: {
      type: String,
      required: true,
    },
    extractedSkills: [
      {
        type: String,
      },
    ],
    // 384-dimensional vector array for local transformer embeddings
    embedding: {
      type: [Number],
      default: [],
    },
  },
  { timestamps: true },
);

export default mongoose.model("Resume", resumeSchema);
