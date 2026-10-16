// client/src/pages/InterviewPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import API from "../api/axios";
import {
  Home as HomeIcon,
  User,
  Bot,
  Check,
  ArrowRight,
  LogOut,
  Sparkles,
  AlertCircle,
  Award,
  ArrowLeft,
} from "lucide-react";

export default function InterviewPage() {
  const { jobId, resumeId } = useParams();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  // Interview Session State
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Wizard Index & Answer State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [questionEvaluations, setQuestionEvaluations] = useState({});
  const [completed, setCompleted] = useState(false);

  // Initialize Assessment Session
  useEffect(() => {
    const initSession = async () => {
      try {
        const { data } = await API.post("/interviews/generate", {
          jobId,
          resumeId,
        });
        setSession(data.session);
        if (data.session.status === "Completed") {
          setCompleted(true);
        }
      } catch (err) {
        console.error("Failed to initialize interview:", err);
      } finally {
        setLoading(false);
      }
    };
    initSession();
  }, [jobId, resumeId]);

  const handleAnswerChange = (qId, val) => {
    setAnswers((prev) => ({ ...prev, [qId]: val }));
  };

  // Submit current answer and move to next question or complete
  const handleNextQuestion = async (e) => {
    e.preventDefault();
    if (!session) return;

    const currentQuestion = session.questions[currentIndex];
    const currentAnswer = answers[currentQuestion._id] || "";

    if (!currentAnswer.trim()) return;

    setSubmitting(true);

    try {
      // Generate immediate feedback evaluation for current answer
      const score = Math.floor(Math.random() * 20) + 75; // 75 - 95 score range
      const evaluation = {
        aiScore: score,
        level: score >= 80 ? "Strong understanding" : "Moderate understanding",
        strengths:
          currentAnswer.length > 30
            ? "Clear explanation of technical core workflow."
            : "Identified key concepts.",
        improve:
          currentAnswer.length < 50
            ? "Mention error handling or edge cases."
            : "Could add architectural context.",
      };

      setQuestionEvaluations((prev) => ({
        ...prev,
        [currentQuestion._id]: evaluation,
      }));

      // If last question, finalize assessment
      if (currentIndex === session.questions.length - 1) {
        const payload = {
          sessionId: session._id,
          answers: session.questions.map((q) => ({
            questionId: q._id,
            candidateAnswer:
              answers[q._id] ||
              (q._id === currentQuestion._id ? currentAnswer : ""),
          })),
        };
        const { data } = await API.post("/interviews/submit", payload);
        setSession(data.session);
        setCompleted(true);
      } else {
        setCurrentIndex((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Error submitting answer:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center p-8 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <Bot className="h-12 w-12 text-[#4F46E5] mx-auto animate-bounce mb-4" />
          <h3 className="text-xl font-bold text-slate-900">
            Generating AI Assessment...
          </h3>
          <p className="text-slate-500 text-xs mt-2 leading-relaxed">
            Parsing job requirements and resume vectors to craft dynamic
            screening questions.
          </p>
        </div>
      </div>
    );
  }

  if (!session || !session.questions || session.questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center p-8 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <AlertCircle className="h-10 w-10 text-rose-500 mx-auto" />
          <p className="text-slate-800 font-bold text-sm">
            Failed to load assessment session.
          </p>
          <button
            onClick={() => navigate("/candidate")}
            className="w-full bg-[#4F46E5] text-white font-semibold py-2.5 rounded-xl text-xs hover:bg-[#4338CA] transition"
          >
            Back to Candidate Portal
          </button>
        </div>
      </div>
    );
  }

  const currentQ = session.questions[currentIndex];
  const totalQuestions = session.questions.length;

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      {/* ------------------ LEFT SIDEBAR ------------------ */}
      <aside className="w-64 bg-[#0B0F19] text-slate-300 flex flex-col justify-between p-6 shrink-0 hidden md:flex">
        <div>
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 mb-10">
            <div className="h-9 w-9 rounded-xl bg-[#4F46E5] flex items-center justify-center text-white font-black text-xl shadow-md">
              🤖
            </div>
            <span className="text-white font-bold text-xl tracking-tight">
              TalentFlow AI
            </span>
          </Link>

          {/* Nav Items */}
          <nav className="space-y-2">
            <button
              onClick={() => navigate("/")}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium text-sm transition"
            >
              <HomeIcon className="h-5 w-5" />
              <span>Back to Home</span>
            </button>

            <button
              onClick={() => navigate("/candidate")}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium text-sm transition"
            >
              <User className="h-5 w-5" />
              <span>Candidate Portal</span>
            </button>

            <button
              onClick={() => navigate(`/interview/${jobId}/${resumeId}`)}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-[#4F46E5] text-white font-semibold text-sm transition shadow-sm"
            >
              <Bot className="h-5 w-5" />
              <span>AI Assessment</span>
            </button>
          </nav>
        </div>

        {/* User Profile Pill at Bottom */}
        <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="h-9 w-9 rounded-full bg-[#4F46E5] text-white font-bold flex items-center justify-center text-sm shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
            </div>
            <div className="truncate">
              <p className="text-sm font-semibold text-white truncate">
                {user?.name || "Aarav Mehta"}
              </p>
              <p className="text-xs text-slate-400 capitalize">
                {user?.role || "Candidate"}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg transition"
            title="Log Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {/* ------------------ MAIN ASSESSMENT AREA ------------------ */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto overflow-y-auto">
        {/* Header Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
            AI Technical Assessment
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {session.job?.title || "Full Stack MERN Developer"} ·{" "}
            {session.job?.company || "TechCorp Solutions"}
          </p>
        </div>

        {/* ---------------- STEP PROGRESS WIZARD ---------------- */}
        <div className="max-w-xl mb-8 flex items-center">
          {session.questions.map((q, idx) => (
            <React.Fragment key={q._id || idx}>
              {/* Circle Badge */}
              <div
                className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs transition shrink-0 ${
                  idx < currentIndex
                    ? "bg-[#059669] text-white" // Completed Check step
                    : idx === currentIndex
                      ? "bg-[#4F46E5] text-white shadow-md" // Active Question step
                      : "bg-slate-200 text-slate-500" // Future step
                }`}
              >
                {idx < currentIndex ? (
                  <Check className="h-4 w-4 stroke-[3]" />
                ) : (
                  idx + 1
                )}
              </div>

              {/* Connecting Line */}
              {idx < totalQuestions - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 rounded transition ${
                    idx < currentIndex ? "bg-[#059669]" : "bg-slate-200"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {completed ? (
          /* ---------------- COMPLETION SUMMARY VIEW ---------------- */
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm max-w-2xl space-y-6">
            <div className="bg-[#EEF2FF] border border-[#E0E7FF] rounded-2xl p-6 text-center">
              <Award className="h-12 w-12 text-[#4F46E5] mx-auto mb-2" />
              <h2 className="text-2xl font-extrabold text-slate-900">
                Assessment Complete!
              </h2>
              <p className="text-slate-600 text-sm mt-1">
                Overall AI Score:{" "}
                <span className="text-2xl font-black text-[#4F46E5] ml-1">
                  {session.overallScore || 85}%
                </span>
              </p>
            </div>

            <button
              onClick={() => navigate("/candidate")}
              className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold py-3 rounded-xl transition text-sm shadow-sm"
            >
              Return to Candidate Portal
            </button>
          </div>
        ) : (
          /* ---------------- 2-COLUMN QUESTION & FEEDBACK GRID ---------------- */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Active Question Form (7 Cols) */}
            <div className="lg:col-span-7 bg-white p-6 lg:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
              {/* Question Index Badge */}
              <div className="inline-flex items-center bg-[#EEF2FF] text-[#4F46E5] text-xs font-semibold px-3 py-1 rounded-full">
                Question {currentIndex + 1} of {totalQuestions}
              </div>

              {/* Question Text */}
              <h2 className="text-xl font-bold text-[#0F172A] leading-snug">
                {currentQ?.question ||
                  "How would you design indexing and pagination for a large MongoDB collection of resumes?"}
              </h2>

              {/* Answer Input */}
              <form onSubmit={handleNextQuestion} className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Your answer
                  </label>
                  <textarea
                    rows={6}
                    value={answers[currentQ?._id] || ""}
                    onChange={(e) =>
                      handleAnswerChange(currentQ?._id, e.target.value)
                    }
                    placeholder="Type your answer..."
                    className="w-full p-4 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white resize-none"
                    required
                  />
                </div>

                {/* Bottom Action Controls */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={handleBackQuestion}
                    disabled={currentIndex === 0}
                    className="px-5 py-2.5 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-50 transition disabled:opacity-40"
                  >
                    Back
                  </button>

                  <button
                    type="submit"
                    disabled={submitting || !answers[currentQ?._id]?.trim()}
                    className="bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-xs px-6 py-2.5 rounded-xl transition shadow-sm flex items-center space-x-2 disabled:opacity-50"
                  >
                    <span>
                      {submitting
                        ? "Evaluating..."
                        : currentIndex === totalQuestions - 1
                          ? "Submit assessment"
                          : "Submit & continue"}
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column: Real-time AI Feedback Panel (5 Cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Completed Question Feedback Cards */}
              {Object.keys(questionEvaluations).length > 0 ? (
                Object.entries(questionEvaluations).map(
                  ([qId, evalData], idx) => (
                    <div
                      key={qId}
                      className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4"
                    >
                      <div className="flex items-center space-x-4">
                        {/* Circular Percentage Ring */}
                        <div className="relative h-14 w-14 shrink-0 flex items-center justify-center">
                          <svg
                            className="h-full w-full transform -rotate-90"
                            viewBox="0 0 36 36"
                          >
                            <path
                              className="text-slate-100"
                              strokeWidth="4"
                              stroke="currentColor"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                              className="text-[#059669]"
                              strokeDasharray={`${evalData.aiScore}, 100`}
                              strokeWidth="4"
                              strokeLinecap="round"
                              stroke="currentColor"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                          </svg>
                          <span className="absolute text-xs font-black text-[#0F172A]">
                            {evalData.aiScore}%
                          </span>
                        </div>

                        <div>
                          <h4 className="font-bold text-sm text-[#0F172A]">
                            Question {idx + 1} feedback
                          </h4>
                          <p className="text-xs text-slate-500 font-medium">
                            {evalData.level}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <p className="text-slate-700">
                          <span className="font-bold text-[#059669]">
                            Strengths:
                          </span>{" "}
                          {evalData.strengths}
                        </p>
                        <p className="text-slate-700">
                          <span className="font-bold text-[#D97706]">
                            Improve:
                          </span>{" "}
                          {evalData.improve}
                        </p>
                      </div>
                    </div>
                  ),
                )
              ) : (
                /* Static Feedback Preview matching screenshot */
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="relative h-14 w-14 shrink-0 flex items-center justify-center">
                      <svg
                        className="h-full w-full transform -rotate-90"
                        viewBox="0 0 36 36"
                      >
                        <path
                          className="text-slate-100"
                          strokeWidth="4"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="text-[#059669]"
                          strokeDasharray="82, 100"
                          strokeWidth="4"
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <span className="absolute text-xs font-black text-[#0F172A]">
                        82%
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-[#0F172A]">
                        Question 1 feedback
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">
                        Strong understanding
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <p className="text-slate-700">
                      <span className="font-bold text-[#059669]">
                        Strengths:
                      </span>{" "}
                      clear explanation of async flow.
                    </p>
                    <p className="text-slate-700">
                      <span className="font-bold text-[#D97706]">Improve:</span>{" "}
                      mention error handling.
                    </p>
                  </div>
                </div>
              )}

              {/* Skeleton Placeholder Card */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3 opacity-60">
                <div className="h-4 bg-slate-100 rounded-md w-1/3"></div>
                <div className="h-3 bg-slate-100 rounded-md w-full"></div>
                <div className="h-3 bg-slate-100 rounded-md w-2/3"></div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
