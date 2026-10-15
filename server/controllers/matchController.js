// server/controllers/matchController.js
import Job from "../models/Job.js";
import Resume from "../models/Resume.js";

// @desc    Match top candidate resumes for a specific job using Vector Search
// @route   GET /api/match/job-resumes/:jobId
export const matchResumesForJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    // 1. Fetch target job details and its vector embedding
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job posting not found" });
    }

    if (!job.embedding || job.embedding.length === 0) {
      return res
        .status(400)
        .json({ message: "Target job does not have a vector index" });
    }

    // 2. Perform MongoDB Atlas Vector Search Aggregation
    const candidateMatches = await Resume.aggregate([
      {
        $vectorSearch: {
          index: "vector_index",
          path: "embedding",
          queryVector: job.embedding,
          numCandidates: 100, // Search space candidate pool
          limit: 10, // Return top 10 best matching candidates
        },
      },
      {
        $project: {
          candidate: 1,
          fileName: 1,
          rawText: 1,
          extractedSkills: 1,
          createdAt: 1,
          // Extract vector search score computed by MongoDB
          score: { $meta: "vectorSearchScore" },
        },
      },
    ]);

    // 3. Populate Candidate User details (Name, Email)
    const populatedMatches = await Resume.populate(candidateMatches, {
      path: "candidate",
      select: "name email",
    });

    // 4. Format scores as percentage (0 - 100%)
    const formattedResults = populatedMatches.map((match) => ({
      _id: match._id,
      candidate: match.candidate,
      fileName: match.fileName,
      extractedSkills: match.extractedSkills,
      rawText: match.rawText.substring(0, 300) + "...", // Text snippet
      matchPercentage: Math.round(match.score * 100),
    }));

    res.status(200).json({
      jobTitle: job.title,
      company: job.company,
      totalMatches: formattedResults.length,
      matches: formattedResults,
    });
  } catch (error) {
    console.error("Vector Match Error:", error);
    res.status(500).json({ message: error.message });
  }
};
