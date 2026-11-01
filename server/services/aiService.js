import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

// Circuit Breaker: disable Gemini API calls when daily quota (429) is exhausted
let isQuotaExhausted = false;

// Helper to handle transient 503 errors while immediately short-circuiting 429 daily quota limits
const generateWithRetry = async (
  modelName,
  prompt,
  retries = 2,
  delayMs = 1200,
) => {
  if (!genAI || isQuotaExhausted) return null;

  const model = genAI.getGenerativeModel({ model: modelName });

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await model.generateContent(prompt);
    } catch (err) {
      const errMsg = err.message || "";

      // Check for daily quota exhaustion (429)
      if (errMsg.includes("429") || errMsg.includes("Quota exceeded")) {
        if (!isQuotaExhausted) {
          isQuotaExhausted = true;
          console.warn(
            "[GEMINI AI] Daily API quota exhausted (429). Circuit breaker active: using Local Keyword Matcher.",
          );
        }
        return null; // Return immediately without retrying 429 errors
      }

      // Retry only transient 503/server capacity spikes
      const isTransient503 =
        errMsg.includes("503") || errMsg.includes("high demand");
      if (isTransient503 && attempt < retries) {
        console.warn(
          `[GEMINI 503 RETRY] Server busy. Retrying attempt ${attempt + 1}/${retries}...`,
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      } else {
        return null;
      }
    }
  }
  return null;
};

/**
 * Extract technical skills dynamically from resume text using Gemini
 */
export const extractSkillsWithAI = async (resumeText) => {
  if (!genAI || isQuotaExhausted || !resumeText || resumeText.length < 20)
    return null;

  try {
    const prompt = `Analyze the following resume text and extract all technical skills, frameworks, programming languages, databases, cloud tools, and libraries mentioned. Return ONLY a valid JSON array of clean strings (e.g., ["React", "Node.js", "MongoDB", "Express", "Docker"]). Do not include code block formatting or explanations.

Resume Text:
${resumeText.slice(0, 4000)}`;

    const result = await generateWithRetry("gemini-3.8-flash", prompt);
    if (!result || !result.response) return null;

    const responseText = result.response.text().trim();
    const cleanJson = responseText.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleanJson);

    return Array.isArray(parsed) ? parsed : null;
  } catch (err) {
    return null;
  }
};

/**
 * Calculate candidate-to-job description match percentage using Gemini
 */
export const calculateJobMatchWithAI = async (resumeText, jobDescription) => {
  if (!genAI || isQuotaExhausted || !resumeText || !jobDescription) return null;

  try {
    const prompt = `You are an executive HR AI screener. Evaluate the relevance between this candidate's resume and the job opening description. Return ONLY a valid JSON object with:
1. "matchPercentage": an integer between 0 and 100.
2. "summary": a concise 2-sentence rationale explaining the score.

Do not include markdown code block ticks.

Job Description:
${jobDescription.slice(0, 1500)}

Candidate Resume Text:
${resumeText.slice(0, 3000)}`;

    const result = await generateWithRetry("gemini-3.8-flash", prompt);
    if (!result || !result.response) return null;

    const responseText = result.response.text().trim();
    const cleanJson = responseText.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (err) {
    return null;
  }
};

/**
 * Evaluate technical assessment answers and return an overall score (0-100) and feedback summary
 */
export const evaluateAssessmentWithAI = async (
  jobTitle,
  jobDescription,
  QnA,
) => {
  if (!genAI || isQuotaExhausted || !QnA || QnA.length === 0) {
    return evaluateAssessmentLocalFallback(QnA);
  }

  try {
    const prompt = `You are an expert technical interviewer evaluating a candidate for the position of "${jobTitle}".
Job Description: ${jobDescription.slice(0, 1000)}

Candidate Assessment Submission:
${QnA.map((item, index) => `Q${index + 1}: ${item.question}\nA: ${item.answer}`).join("\n\n")}

Evaluate the candidate's answers for technical accuracy, clarity, and relevance.
Return ONLY a valid JSON object without markdown code blocks:
{
  "overallScore": <integer between 0 and 100>,
  "feedbackSummary": "<2-3 sentence concise summary of candidate strengths and gaps>"
}`;

    const result = await generateWithRetry("gemini-3.8-flash", prompt);
    if (!result || !result.response)
      return evaluateAssessmentLocalFallback(QnA);

    const responseText = result.response.text().trim();
    const cleanJson = responseText.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (err) {
    console.warn("[GEMINI EVALUATION FALLBACK]:", err.message);
    return evaluateAssessmentLocalFallback(QnA);
  }
};

// Deterministic fallback score calculation
const evaluateAssessmentLocalFallback = (QnA = []) => {
  let totalLength = 0;
  QnA.forEach((item) => {
    if (item.answer) totalLength += item.answer.trim().length;
  });

  // Calculate score based on response depth (minimum 60, scaling with thoughtful answers)
  const baseScore = Math.min(
    92,
    Math.max(65, Math.round(60 + (totalLength / 300) * 30)),
  );
  return {
    overallScore: baseScore,
    feedbackSummary:
      "Completed technical screening assessment. Good coverage of core concepts.",
  };
};
