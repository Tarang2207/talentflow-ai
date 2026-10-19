// server/controllers/jobController.js
import Job from "../models/Job.js";
import { generateEmbedding } from "../utils/vectorGenerator.js";

// @desc    Create new job opening and generate vector embedding
// @route   POST /api/jobs
export const createJob = async (req, res) => {
  try {
    const { title, company, description, skillsRequired, skills } = req.body;

    if (!title || !description) {
      return res
        .status(400)
        .json({ message: "Title and description are required" });
    }

    // Safely parse skills array whether passed as string or array
    let processedSkills = [];
    const rawSkills = skillsRequired || skills;

    if (Array.isArray(rawSkills)) {
      processedSkills = rawSkills;
    } else if (typeof rawSkills === "string" && rawSkills.trim().length > 0) {
      processedSkills = rawSkills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    // Build text payload for local vector embedding
    const textToEmbed =
      `${title} ${description} ${processedSkills.join(" ")}`.trim();

    let embedding = [];
    try {
      if (textToEmbed) {
        embedding = await generateEmbedding(textToEmbed);
      }
    } catch (embedErr) {
      console.warn("Vector embedding creation fallback:", embedErr.message);
    }

    const job = await Job.create({
      title,
      company: company || "TechCorp Solutions",
      description,
      skillsRequired: processedSkills,
      embedding,
      postedBy: req.user?._id,
    });

    res.status(201).json({
      message: "Job opening posted & vector indexed successfully",
      job,
    });
  } catch (error) {
    console.error("Create Job Error:", error);
    res
      .status(500)
      .json({ message: error.message || "Failed to create job posting" });
  }
};

// @desc    Get all jobs
// @route   GET /api/jobs
export const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job opening not found" });
    }
    return res.status(200).json(job);
  } catch (error) {
    console.error("[GET JOB BY ID ERROR]:", error);
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Update Job Assessment Questions
// @route   PUT /api/jobs/:id
export const updateJobQuestions = async (req, res) => {
  try {
    const { customQuestions } = req.body;
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { customQuestions },
      { new: true },
    );

    if (!job) {
      return res.status(404).json({ message: "Job opening not found" });
    }

    return res.status(200).json({
      message: "Assessment questions updated successfully!",
      job,
    });
  } catch (error) {
    console.error("[UPDATE JOB QUESTIONS ERROR]:", error);
    return res.status(500).json({ message: error.message });
  }
};
