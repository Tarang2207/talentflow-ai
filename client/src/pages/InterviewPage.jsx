// client/src/pages/InterviewPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { Bot, Send, Award, Sparkles, AlertCircle } from "lucide-react";

export default function InterviewPage() {
  const { jobId, resumeId } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState({});
  const [completed, setCompleted] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        sessionId: session._id,
        answers: session.questions.map((q) => ({
          questionId: q._id,
          candidateAnswer: answers[q._id] || "",
        })),
      };
      const { data } = await API.post("/interviews/submit", payload);
      setSession(data.session);
      setCompleted(true);
    } catch (err) {
      console.error("Failed to submit interview:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto mt-20 text-center p-8 bg-white rounded-2xl border border-slate-200">
        <Bot className="h-12 w-12 text-indigo-600 mx-auto animate-bounce mb-4" />
        <h3 className="text-xl font-bold text-slate-800">
          Generating AI Screening Assessment...
        </h3>
        <p className="text-slate-500 text-sm mt-2">
          Analyzing job requirements against your resume experience to craft
          tailored technical questions.
        </p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center p-8 bg-white rounded-2xl border border-slate-200">
        <AlertCircle className="h-10 w-10 text-rose-500 mx-auto mb-3" />
        <p className="text-slate-800 font-semibold mb-4">
          Failed to load interview session.
        </p>
        <button
          onClick={() => navigate("/candidate")}
          className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
        >
          Back to Candidate Portal
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto my-12 px-4">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-6 mb-6">
          <div>
            <div className="flex items-center space-x-2 text-indigo-600 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="h-4 w-4" />
              <span>AI Technical Screening</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Technical Assessment
            </h1>
          </div>
          <div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                completed
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {completed ? "Completed" : "In Progress"}
            </span>
          </div>
        </div>

        {completed ? (
          <div className="space-y-6">
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 text-center">
              <Award className="h-12 w-12 text-indigo-600 mx-auto mb-2" />
              <h2 className="text-xl font-bold text-slate-900">
                Assessment Complete!
              </h2>
              <p className="text-slate-600 text-sm mt-1">
                Overall AI Evaluation Score:{" "}
                <span className="text-2xl font-black text-indigo-600 ml-1">
                  {session.overallScore}%
                </span>
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-slate-800">
                Question Evaluation Breakdown
              </h3>
              {session.questions.map((q, idx) => (
                <div
                  key={q._id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2"
                >
                  <p className="font-medium text-slate-900 text-sm">
                    Q{idx + 1}: {q.question}
                  </p>
                  <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs text-slate-700">
                    <span className="font-semibold text-slate-500 block mb-1">
                      Your Response:
                    </span>
                    {q.candidateAnswer || "No answer provided"}
                  </div>
                  <div className="flex items-start justify-between bg-indigo-50/50 p-3 rounded-lg border border-indigo-100 text-xs text-indigo-900">
                    <div>
                      <span className="font-semibold block text-indigo-700">
                        AI Evaluation Feedback:
                      </span>
                      <p className="mt-0.5">{q.feedback}</p>
                    </div>
                    <span className="font-bold text-sm text-indigo-600 bg-white px-2.5 py-1 rounded border border-indigo-200 ml-3 shrink-0">
                      {q.aiScore}/100
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate("/candidate")}
              className="w-full bg-slate-900 text-white font-semibold py-3 rounded-lg hover:bg-slate-800 transition"
            >
              Return to Candidate Portal
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {session.questions.map((q, idx) => (
              <div
                key={q._id}
                className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-3"
              >
                <label className="block font-medium text-slate-900 text-sm">
                  Question {idx + 1}: {q.question}
                </label>
                <textarea
                  rows={4}
                  value={answers[q._id] || ""}
                  onChange={(e) => handleAnswerChange(q._id, e.target.value)}
                  placeholder="Provide your detailed technical explanation..."
                  className="w-full p-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  required
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              <span>
                {submitting
                  ? "Evaluating Responses with AI..."
                  : "Submit Assessment"}
              </span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
