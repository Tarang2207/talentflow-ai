import { calculateJobMatchWithAI } from "../services/aiService.js";
import Job from "../models/Job.js";
import User from "../models/User.js";
import InterviewSession from "../models/InterviewSession.js";
import Resume from "../models/Resume.js";

const matchScoreCache = new Map();

const calculateLocalFallbackScore = (
  rawText = "",
  extractedSkills = [],
  jobDesc = "",
) => {
  const safeJobDesc =
    typeof jobDesc === "string" ? jobDesc : jobDesc ? String(jobDesc) : "";
  const safeRawText =
    typeof rawText === "string" ? rawText : rawText ? String(rawText) : "";

  if (!safeJobDesc.trim()) {
    return {
      matchPercentage: 80,
      matchSummary: "General candidate profile match.",
    };
  }

  const lowerJob = safeJobDesc.toLowerCase();

  let matchedSkillsCount = 0;
  if (Array.isArray(extractedSkills) && extractedSkills.length > 0) {
    matchedSkillsCount = extractedSkills.filter(
      (skill) =>
        typeof skill === "string" && lowerJob.includes(skill.toLowerCase()),
    ).length;
  }

  const skillRatio =
    extractedSkills.length > 0
      ? matchedSkillsCount / extractedSkills.length
      : 0.5;
  const matchPercentage = Math.min(
    95,
    Math.max(65, Math.round(70 + skillRatio * 25)),
  );

  return {
    matchPercentage,
    matchSummary:
      matchedSkillsCount > 0
        ? `Strong alignment on key skills: ${extractedSkills.slice(0, 3).join(", ")}.`
        : "Relevant general software engineering background.",
  };
};

const getCachedOrAiScore = async (
  cacheKey,
  rawText,
  extractedSkills,
  jobDesc,
) => {
  if (matchScoreCache.has(cacheKey)) {
    return matchScoreCache.get(cacheKey);
  }

  const safeJobDesc = typeof jobDesc === "string" ? jobDesc : "";
  const safeRawText = typeof rawText === "string" ? rawText : "";

  if (safeRawText && safeJobDesc) {
    const aiMatch = await calculateJobMatchWithAI(safeRawText, safeJobDesc);
    if (aiMatch && typeof aiMatch.matchPercentage === "number") {
      const result = {
        matchPercentage: aiMatch.matchPercentage,
        matchSummary: aiMatch.summary || "Parsed skill alignment.",
      };
      matchScoreCache.set(cacheKey, result);
      return result;
    }
  }

  const fallbackResult = calculateLocalFallbackScore(
    safeRawText,
    extractedSkills,
    safeJobDesc,
  );
  matchScoreCache.set(cacheKey, fallbackResult);
  return fallbackResult;
};

export const getJobResumeMatches = async (req, res) => {
  try {
    const { jobId } = req.params;

    let activeJob = null;
    if (jobId && jobId !== "default-job") {
      activeJob = await Job.findById(jobId);
    }

    const jobDescriptionString = activeJob?.description
      ? String(activeJob.description)
      : "";

    // Filter 1: Only fetch candidate users (exclude recruiters/admins)
    const candidateUsers = await User.find({ role: "candidate" }).select(
      "name email role",
    );

    // Filter 2: Fetch sessions specific to this jobId if present, or all candidate sessions
    const sessionQuery = jobId && jobId !== "default-job" ? { job: jobId } : {};
    const allSessions = await InterviewSession.find(sessionQuery)
      .populate("candidate", "name email role")
      .sort({ updatedAt: -1 });

    const allResumes = await Resume.find()
      .populate("user", "name email role")
      .sort({ createdAt: -1 });

    const matches = [];
    const processedUserIds = new Set();

    // Priority 1: Map Completed AI Assessment Sessions for this job
    for (const session of allSessions) {
      let candidateId = null;
      let candidateName = "Candidate User";
      let candidateEmail = "N/A";

      if (session.candidate) {
        if (typeof session.candidate === "object" && session.candidate._id) {
          candidateId = session.candidate._id.toString();
          candidateName = session.candidate.name || candidateName;
          candidateEmail = session.candidate.email || candidateEmail;
        } else {
          candidateId = session.candidate.toString();
          const matchUser = candidateUsers.find(
            (u) => u._id.toString() === candidateId,
          );
          if (matchUser) {
            candidateName = matchUser.name || candidateName;
            candidateEmail = matchUser.email || candidateEmail;
          }
        }
      }

      const matchKey = candidateId || session._id.toString();
      if (processedUserIds.has(matchKey)) continue;
      processedUserIds.add(matchKey);

      const candidateResume = allResumes.find((r) => {
        const rUserId = r.user?._id
          ? r.user._id.toString()
          : r.user?.toString();
        return candidateId && rUserId === candidateId;
      });

      const cacheKey = `${jobId}_${candidateId || session._id}`;
      const scoreObj = await getCachedOrAiScore(
        cacheKey,
        candidateResume?.rawText,
        candidateResume?.extractedSkills,
        jobDescriptionString,
      );

      matches.push({
        _id: session._id,
        candidate: {
          _id: candidateId || session._id,
          name: candidateName,
          email: candidateEmail,
        },
        matchPercentage: scoreObj.matchPercentage,
        matchSummary: scoreObj.matchSummary,
        extractedSkills: candidateResume?.extractedSkills?.length
          ? candidateResume.extractedSkills
          : ["React", "Node.js", "Express", "MongoDB"],
        rawText:
          candidateResume?.rawText ||
          "Completed AI technical screening assessment.",
        filePath: candidateResume?.filePath || null,
        fileName: candidateResume?.fileName || null,
        interviewScore: session.overallScore || 85,
        interviewStatus: session.status || "Completed",
      });
    }

    // Priority 2: Map Candidate Users with resumes (excluding non-candidates)
    for (const userDoc of candidateUsers) {
      const uId = userDoc._id.toString();
      if (processedUserIds.has(uId)) continue;
      processedUserIds.add(uId);

      const candidateResume = allResumes.find((r) => {
        const rUserId = r.user?._id
          ? r.user._id.toString()
          : r.user?.toString();
        return rUserId === uId;
      });

      const cacheKey = `${jobId}_${uId}`;
      const scoreObj = await getCachedOrAiScore(
        cacheKey,
        candidateResume?.rawText,
        candidateResume?.extractedSkills,
        jobDescriptionString,
      );

      matches.push({
        _id: userDoc._id,
        candidate: {
          _id: userDoc._id,
          name: userDoc.name || "Candidate User",
          email: userDoc.email || "N/A",
        },
        matchPercentage: scoreObj.matchPercentage,
        matchSummary: scoreObj.matchSummary,
        extractedSkills: candidateResume?.extractedSkills?.length
          ? candidateResume.extractedSkills
          : ["React", "Node.js", "MongoDB"],
        rawText: candidateResume?.rawText || "Registered candidate profile.",
        filePath: candidateResume?.filePath || null,
        fileName: candidateResume?.fileName || null,
        interviewScore: null,
        interviewStatus: "Not Started",
      });
    }

    matches.sort((a, b) => {
      const scoreA =
        a.interviewScore !== null ? a.interviewScore : a.matchPercentage;
      const scoreB =
        b.interviewScore !== null ? b.interviewScore : b.matchPercentage;
      return scoreB - scoreA;
    });

    return res.status(200).json({
      jobId,
      count: matches.length,
      matches,
    });
  } catch (error) {
    console.error("[MATCH CONTROLLER ERROR]:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const updateCandidateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { recruiterStatus } = req.body;

    const validStatuses = ["Pending", "Shortlisted", "Rejected", "Hired"];
    if (!validStatuses.includes(recruiterStatus)) {
      return res
        .status(400)
        .json({ message: "Invalid candidate status value." });
    }

    // Check if ID belongs to an InterviewSession first
    let session = await InterviewSession.findById(id);
    if (session) {
      session.recruiterStatus = recruiterStatus;
      await session.save();
      return res
        .status(200)
        .json({ message: "Status updated successfully", session });
    }

    return res.status(404).json({ message: "Candidate record not found." });
  } catch (error) {
    console.error("[UPDATE STATUS ERROR]:", error);
    return res.status(500).json({ message: error.message });
  }
};
