import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useAuthStore } from "../store/useAuthStore";
import {
  Bot,
  CheckCircle2,
  Clock,
  Send,
  Sparkles,
  ArrowLeft,
} from "lucide-react";

export default function CandidateAssessment() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [jobInfo, setJobInfo] = useState({ title: "", questions: [] });
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const { data } = await API.get(
          `/assessment/questions/${jobId || "default-job"}`,
        );
        setJobInfo({ title: data.jobTitle, questions: data.questions });

        // Initialize empty answers map
        const initialAnswers = {};
        data.questions.forEach((_, idx) => {
          initialAnswers[idx] = "";
        });
        setAnswers(initialAnswers);
      } catch (err) {
        console.error("Error loading assessment questions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [jobId]);

  const handleAnswerChange = (index, value) => {
    setAnswers({ ...answers, [index]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Extract the actual logged-in user's MongoDB _id
    const candidateId = user?._id || user?.id;

    const QnA = jobInfo.questions.map((question, idx) => ({
      question,
      answer: answers[idx] || "",
    }));

    try {
      const { data } = await API.post("/assessment/submit", {
        jobId: jobId || "default-job",
        candidateId, // Real 24-hex MongoDB ObjectId string
        QnA,
      });

      setResult(data.evaluation);
    } catch (err) {
      console.error("Failed to submit assessment:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center text-slate-400 text-sm">
        <Bot className="h-6 w-6 animate-spin text-indigo-500 mr-2" />
        Loading Technical Assessment...
      </div>
    );
  }

  if (result) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6">
        <div className="bg-white max-w-lg w-full rounded-3xl p-8 border border-slate-100 shadow-xl text-center space-y-6 animate-fadeIn">
          <div className="h-16 w-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-[#0F172A]">
              Assessment Submitted!
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              AI Evaluated Response Overview
            </p>
          </div>

          <div className="bg-indigo-50/80 p-6 rounded-2xl border border-indigo-100 space-y-2">
            <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider block">
              AI Competency Score
            </span>
            <span className="text-4xl font-black text-indigo-600">
              {result.overallScore}%
            </span>
            <p className="text-xs text-slate-600 leading-relaxed pt-2 border-t border-indigo-100">
              {result.feedbackSummary}
            </p>
          </div>

          <button
            onClick={() => navigate("/recruiter")}
            className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold py-3 rounded-xl text-sm transition shadow-sm"
          >
            Return to Leaderboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6 md:p-12">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 flex items-center space-x-1.5">
            <Bot className="h-3.5 w-3.5" />
            <span>AI Automated Technical Screening</span>
          </span>
        </div>

        {/* Title Card */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-2">
          <h1 className="text-2xl font-black text-[#0F172A]">
            {jobInfo.title}
          </h1>
          <p className="text-xs text-slate-500">
            Complete the questions below. Your answers will be analyzed by
            TalentFlow AI to measure role alignment.
          </p>
        </div>

        {/* Questions Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {jobInfo.questions.map((questionText, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3"
            >
              <label className="block text-sm font-bold text-[#0F172A]">
                Question {idx + 1}:{" "}
                <span className="font-normal text-slate-700">
                  {questionText}
                </span>
              </label>
              <textarea
                rows={4}
                value={answers[idx] || ""}
                onChange={(e) => handleAnswerChange(idx, e.target.value)}
                placeholder="Type your technical solution or explanation here..."
                className="w-full p-4 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 resize-none leading-relaxed"
                required
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold py-4 rounded-2xl transition shadow-sm text-sm disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {submitting ? (
              <>
                <Sparkles className="h-5 w-5 animate-spin" />
                <span>AI Scoring Answers...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Submit Technical Assessment</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
