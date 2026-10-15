// server/controllers/jobController.js
import Job from "../models/Job.js";
import { generateEmbedding } from "../utils/embedding.js";

// @desc    Create a new job & generate vector embedding
// @route   POST /api/jobs
export const createJob = async (req, res) => {
  try {
    const { title, company, description, requiredSkills } = req.body;

    if (!title || !company || !description) {
      return res
        .status(400)
        .json({ message: "Please provide title, company, and description" });
    }

    // Combine title, description, and skills into one rich text string for vector generation
    const textToEmbed = `Job Title: ${title}. Company: ${company}. Skills: ${
      Array.isArray(requiredSkills) ? requiredSkills.join(", ") : requiredSkills
    }. Description: ${description}`;

    // Generate local 384-dimensional vector embedding ($0 cost)
    const embeddingVector = await generateEmbedding(textToEmbed);

    const job = await Job.create({
      title,
      company,
      description,
      requiredSkills: Array.isArray(requiredSkills)
        ? requiredSkills
        : requiredSkills.split(",").map((s) => s.trim()),
      postedBy: req.user._id,
      embedding: embeddingVector,
    });

    res.status(201).json({
      message: "Job published and vector indexed successfully",
      job,
    });
  } catch (error) {
    console.error("Job Creation Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all active jobs
// @route   GET /api/jobs
export const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find()
      .sort({ createdAt: -1 })
      .populate("postedBy", "name email");
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
