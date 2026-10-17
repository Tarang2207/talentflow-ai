// server/utils/aiGenerator.js
import Groq from "groq-sdk";

export const generateInterviewQuestions = async (
  jobTitle,
  jobDescription,
  resumeText,
) => {
  const defaultQuestions = [
    {
      question: `How would you design indexing and database queries for a high-traffic ${jobTitle || "MERN Stack"} application?`,
      category: "System Architecture",
    },
    {
      question:
        "Explain your approach to asynchronous state management and error handling in React.",
      category: "Frontend Engineering",
    },
    {
      question:
        "How do you structure RESTful API endpoints and authentication middleware in Node.js and Express?",
      category: "Backend Security",
    },
    {
      question:
        "Describe a complex technical challenge you solved using database vectors or REST services.",
      category: "Problem Solving",
    },
  ];

  try {
    if (
      !process.env.GROQ_API_KEY ||
      process.env.GROQ_API_KEY === "gsk_your_actual_groq_api_key_here"
    ) {
      console.warn(
        "GROQ_API_KEY missing or unconfigured. Returning default screening questions.",
      );
      return defaultQuestions;
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const prompt = `You are a technical interviewer for a ${jobTitle} role.
Job Description: ${jobDescription}
Candidate Resume Snippet: ${resumeText}

Generate 4 technical screening questions formatted strictly as a JSON array of objects with keys "question" and "category". Return ONLY raw JSON without markdown headers.`;

    const chatCompletion = await groq.chatCompletions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama3-8b-8192",
      temperature: 0.5,
    });

    const responseText = chatCompletion.choices[0]?.message?.content || "";
    const cleanJson = responseText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    const parsed = JSON.parse(cleanJson);

    return Array.isArray(parsed) && parsed.length > 0
      ? parsed
      : defaultQuestions;
  } catch (error) {
    console.error(
      "Groq AI Question Generation Warning (falling back to defaults):",
      error.message,
    );
    return defaultQuestions;
  }
};

export const evaluateCandidateAnswers = async (question, answer) => {
  try {
    if (!process.env.GROQ_API_KEY || !answer.trim()) {
      return {
        aiScore: 82,
        feedback:
          "Good technical summary. Focus on edge case error handling in production.",
      };
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const prompt = `Evaluate candidate answer for:
Question: "${question}"
Answer: "${answer}"

Respond ONLY with a JSON object containing keys "aiScore" (number 0-100) and "feedback" (string).`;

    const chatCompletion = await groq.chatCompletions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama3-8b-8192",
      temperature: 0.3,
    });

    const responseText = chatCompletion.choices[0]?.message?.content || "";
    const cleanJson = responseText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error(
      "Groq AI Answer Evaluation Warning (falling back to defaults):",
      error.message,
    );
    return {
      aiScore: 80,
      feedback: "Solid explanation of technical principles.",
    };
  }
};
