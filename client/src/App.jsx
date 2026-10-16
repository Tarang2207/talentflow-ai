// client/src/App.jsx
import React, { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import {
  Upload,
  Briefcase,
  Mic,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  X,
} from "lucide-react";
import { useAuthStore } from "./store/useAuthStore";
import Navbar from "./components/Navbar";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import CandidatePortal from "./pages/CandidatePortal";
import AuthPage from "./pages/AuthPage";
import InterviewPage from "./pages/InterviewPage";
import ProtectedRoute from "./components/ProtectedRoute";

function Home() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [roleNotice, setRoleNotice] = useState(null);

  const handleCandidateClick = () => {
    setRoleNotice(null);
    if (!user) {
      navigate("/login");
    } else if (user.role === "Candidate") {
      navigate("/candidate");
    } else {
      setRoleNotice({
        title: "Recruiter Account Detected",
        message:
          "You are currently signed in as a Recruiter. The Candidate Portal is intended for job applicants.",
        targetRole: "Recruiter",
        actionPath: "/recruiter",
        actionLabel: "Go to Recruiter Dashboard",
      });
    }
  };

  const handleRecruiterClick = () => {
    setRoleNotice(null);
    if (!user) {
      navigate("/login");
    } else if (user.role === "Recruiter") {
      navigate("/recruiter");
    } else {
      setRoleNotice({
        title: "Candidate Account Detected",
        message:
          "You are currently signed in as a Candidate. The Recruiter Dashboard is reserved for hiring managers and recruiters.",
        targetRole: "Candidate",
        actionPath: "/candidate",
        actionLabel: "Go to Candidate Portal",
      });
    }
  };

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      <div className="max-w-5xl mx-auto px-4 pt-8 pb-20 text-center">
        {roleNotice && (
          <div className="mb-8 max-w-2xl mx-auto bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-2xl shadow-sm text-left relative flex items-start space-x-3">
            <ShieldAlert className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold text-sm text-amber-950">
                {roleNotice.title}
              </h4>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                {roleNotice.message}
              </p>
              <div className="mt-3 flex items-center space-x-3">
                <button
                  onClick={() => navigate(roleNotice.actionPath)}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs px-3 py-1.5 rounded-lg transition"
                >
                  {roleNotice.actionLabel}
                </button>
                <button
                  onClick={() => {
                    logout();
                    navigate("/login");
                  }}
                  className="text-amber-800 hover:text-amber-950 font-semibold text-xs underline transition"
                >
                  Switch account
                </button>
              </div>
            </div>
            <button
              onClick={() => setRoleNotice(null)}
              className="text-amber-500 hover:text-amber-800 p-1 rounded-lg transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="inline-flex items-center space-x-1.5 bg-[#EEF2FF] border border-[#E0E7FF] text-[#4F46E5] text-xs font-semibold px-3 py-1 rounded-full mb-8">
          <Sparkles className="h-3 w-3" />
          <span>RAG-powered screening</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold text-[#0F172A] tracking-tight leading-[1.1] mb-6">
          Screen smarter. <br />
          <span className="text-[#0F172A]">
            Hire the right engineer faster.
          </span>
        </h1>

        <p className="text-lg text-[#475569] max-w-2xl mx-auto mb-10 leading-relaxed">
          Upload a resume, get an instant semantic match score, then take an
          AI-led technical interview.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <button
            onClick={handleCandidateClick}
            className="w-full sm:w-auto bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold px-6 py-3 rounded-lg transition flex items-center justify-center space-x-2 shadow-sm"
          >
            <span>I'm a candidate</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            onClick={handleRecruiterClick}
            className="w-full sm:w-auto bg-white hover:bg-slate-50 text-[#334155] border border-slate-200 font-semibold px-6 py-3 rounded-lg transition shadow-sm"
          >
            I'm a recruiter
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
            <div className="inline-flex p-3 rounded-xl bg-[#EEF2FF] text-[#4F46E5] mb-5">
              <Upload className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-[#0F172A] mb-2">
              Resume vector matching
            </h3>
            <p className="text-[#475569] text-sm leading-relaxed">
              PDF resumes are embedded and ranked against each job description.
            </p>
          </div>

          <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
            <div className="inline-flex p-3 rounded-xl bg-[#ECFDF5] text-[#059669] mb-5">
              <Briefcase className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-[#0F172A] mb-2">
              Ranked match leaderboard
            </h3>
            <p className="text-[#475569] text-sm leading-relaxed">
              Recruiters see candidates sorted by score percentage.
            </p>
          </div>

          <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
            <div className="inline-flex p-3 rounded-xl bg-[#FFFBEB] text-[#D97706] mb-5">
              <Mic className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-[#0F172A] mb-2">
              AI technical interview
            </h3>
            <p className="text-[#475569] text-sm leading-relaxed">
              Step-by-step questions with instant evaluation feedback.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MainLayout() {
  const location = useLocation();
  // Hide top Navbar on login, candidate portal, and recruiter dashboard
  const hideNavbar = ["/login", "/candidate", "/recruiter"].some((path) =>
    location.pathname.startsWith(path),
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {!hideNavbar && <Navbar />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<AuthPage />} />

          <Route
            path="/candidate"
            element={
              <ProtectedRoute allowedRoles={["Candidate"]}>
                <CandidatePortal />
              </ProtectedRoute>
            }
          />

          <Route
            path="/recruiter"
            element={
              <ProtectedRoute allowedRoles={["Recruiter"]}>
                <RecruiterDashboard />
              </ProtectedRoute>
            }
          />

          {/* Candidate & Recruiter Screening Assessment Route */}
          <Route
            path="/interview/:jobId/:resumeId"
            element={
              <ProtectedRoute allowedRoles={["Candidate", "Recruiter"]}>
                <InterviewPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <MainLayout />
    </BrowserRouter>
  );
}
