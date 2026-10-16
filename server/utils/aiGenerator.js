// server/utils/aiGenerator.js
import Groq from "groq-sdk";

const getGroqClient = () => {
  if (!process.env.GROQ_API_KEY) {
    return null;
  }
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
};

export const generateInterviewQuestions = async (
  jobTitle,
  jobDescription,
  resumeText,
) => {
  const groq = getGroqClient();

  if (!groq) {
    console.warn("GROQ_API_KEY not set. Using template question generator.");
    return [
      {
        question: `Can you explain your experience with the core technologies required for the ${jobTitle} role?`,
        candidateAnswer: "",
        aiScore: 0,
        feedback: "",
      },
      {
        question: `How have you handled architecture or performance challenges in past projects listed on your resume?`,
        candidateAnswer: "",
        aiScore: 0,
        feedback: "",
      },
      {
        question: `Walk us through a technical feature you built that directly matches the requirements of this opening.`,
        candidateAnswer: "",
        aiScore: 0,
        feedback: "",
      },
    ];
  }

  const prompt = `
You are an expert technical interviewer for the position of "${jobTitle}".

Job Description:
${jobDescription.substring(0, 1200)}

Candidate Resume:
${resumeText.substring(0, 1200)}

Task:
Analyze the alignment and gap between the candidate's resume and the job requirements. 
Generate exactly 3 technical screening questions specifically tailored to test their depth in key skills or probe potential skill gaps.

Return ONLY a JSON object formatted as follows:
{
  "questions": [
    "Question 1?",
    "Question 2?",
    "Question 3?"
  ]
}
`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.4,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    const parsed = JSON.parse(content);
    const questionsArray = parsed.questions || parsed;

    return questionsArray.map((q) => ({
      question: typeof q === "string" ? q : q.question || "Technical Question",
      candidateAnswer: "",
      aiScore: 0,
      feedback: "",
    }));
  } catch (error) {
    console.error("Error generating AI questions:", error);
    return [
      {
        question: `Can you describe your experience with the tech stack required for ${jobTitle}?`,
        candidateAnswer: "",
        aiScore: 0,
        feedback: "",
      },
      {
        question: `What was the most challenging technical problem you solved on your resume?`,
        candidateAnswer: "",
        aiScore: 0,
        feedback: "",
      },
      {
        question: `How do your technical skills align with the core responsibilities of this position?`,
        candidateAnswer: "",
        aiScore: 0,
        feedback: "",
      },
    ];
  }
};

// Evaluate candidate answers using LLM
export const evaluateCandidateAnswers = async (question, candidateAnswer) => {
  const groq = getGroqClient();

  // Fallback evaluator if no API key is provided
  if (!groq || !candidateAnswer || candidateAnswer.trim().length === 0) {
    return {
      aiScore: candidateAnswer?.trim().length > 20 ? 75 : 30,
      feedback:
        candidateAnswer?.trim().length > 20
          ? "Answer provides general technical context but could include more specific architectural details."
          : "Answer is too brief to adequately demonstrate technical depth.",
    };
  }

  const prompt = `
You are an expert technical interviewer evaluating a candidate's answer.

Question: "${question}"
Candidate Answer: "${candidateAnswer}"

Evaluate the candidate's answer based on technical accuracy, depth, and clarity.
Assign an integer score from 0 to 100 and write a concise 1-2 sentence feedback evaluation.

Return ONLY a JSON object formatted as follows:
{
  "aiScore": 85,
  "feedback": "Concise evaluation feedback here."
}
`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    const parsed = JSON.parse(completion.choices[0]?.message?.content);
    return {
      aiScore: parsed.aiScore || 70,
      feedback: parsed.feedback || "Good technical effort.",
    };
  } catch (error) {
    console.error("Error evaluating answer:", error);
    return {
      aiScore: 70,
      feedback: "Answer shows reasonable technical understanding.",
    };
  }
};
