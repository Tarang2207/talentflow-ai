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

  // Inside client/src/App.jsx -> Home() component

  const handleCandidateClick = () => {
    setRoleNotice(null);
    if (!user) {
      navigate("/login");
    } else if (user.role?.toLowerCase() === "candidate") {
      // <-- Added .toLowerCase()
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
    } else if (user.role?.toLowerCase() === "recruiter") {
      // <-- Added .toLowerCase()
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
      <div className="max-w-5xl mx-auto px-4 pt-12 pb-20 text-center">
        {/* Role Mismatch Notice Banner */}
        {roleNotice && (
          <div className="mb-8 max-w-2xl mx-auto bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-2xl shadow-sm text-left relative flex items-start space-x-3 animate-in fade-in slide-in-from-top-4 duration-300">
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

        {/* Sparkle Badge */}
        <div className="inline-flex items-center space-x-1.5 bg-[#EEF2FF] border border-[#E0E7FF] text-[#4F46E5] text-xs font-semibold px-3 py-1 rounded-full mb-8 hover:scale-105 transition-transform duration-300 cursor-default">
          <Sparkles className="h-3.5 w-3.5 animate-pulse text-indigo-500" />
          <span>RAG-powered screening</span>
        </div>

        {/* Big H1 Typography */}
        <h1 className="text-5xl md:text-6xl font-extrabold text-[#0F172A] tracking-tight leading-[1.1] mb-6">
          Screen smarter. <br />
          <span className="text-[#0F172A]">
            Hire the right engineer faster.
          </span>
        </h1>

        {/* Subtitle text */}
        <p className="text-lg text-[#475569] max-w-2xl mx-auto mb-10 leading-relaxed">
          Upload a resume, get an instant semantic match score, then take an
          AI-led technical interview.
        </p>

        {/* Smart CTA Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <button
            onClick={handleCandidateClick}
            className="w-full sm:w-auto bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold px-6 py-3.5 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center space-x-2 group"
          >
            <span>I'm a candidate</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
          </button>

          <button
            onClick={handleRecruiterClick}
            className="w-full sm:w-auto bg-white hover:bg-slate-50 text-[#334155] border border-slate-200 hover:border-slate-300 font-semibold px-6 py-3.5 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-md"
          >
            I'm a recruiter
          </button>
        </div>

        {/* Animated Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {/* Card 1 */}
          <div className="group bg-white border border-slate-200/80 p-7 rounded-3xl transition-all duration-300 ease-out transform hover:-translate-y-2 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="inline-flex p-3.5 rounded-2xl bg-[#EEF2FF] text-[#4F46E5] mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 ease-out">
              <Upload className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-[#0F172A] mb-2 group-hover:text-[#4F46E5] transition-colors duration-200">
              Resume vector matching
            </h3>
            <p className="text-[#475569] text-sm leading-relaxed">
              PDF resumes are embedded into 384-dimensional vectors and ranked
              against each job description.
            </p>
          </div>

          {/* Card 2 */}
          <div className="group bg-white border border-slate-200/80 p-7 rounded-3xl transition-all duration-300 ease-out transform hover:-translate-y-2 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="inline-flex p-3.5 rounded-2xl bg-[#ECFDF5] text-[#059669] mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 ease-out">
              <Briefcase className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-[#0F172A] mb-2 group-hover:text-[#059669] transition-colors duration-200">
              Ranked match leaderboard
            </h3>
            <p className="text-[#475569] text-sm leading-relaxed">
              Recruiters view candidates instantly sorted by cosine similarity
              match score percentage.
            </p>
          </div>

          {/* Card 3 */}
          <div className="group bg-white border border-slate-200/80 p-7 rounded-3xl transition-all duration-300 ease-out transform hover:-translate-y-2 hover:border-amber-200 hover:shadow-xl hover:shadow-amber-500/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="inline-flex p-3.5 rounded-2xl bg-[#FFFBEB] text-[#D97706] mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 ease-out">
              <Mic className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-[#0F172A] mb-2 group-hover:text-[#D97706] transition-colors duration-200">
              AI technical interview
            </h3>
            <p className="text-[#475569] text-sm leading-relaxed">
              Interactive step-by-step technical screening questions with
              instant evaluation breakdown.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MainLayout() {
  const location = useLocation();
  const hideNavbar = ["/login", "/candidate", "/recruiter", "/interview"].some(
    (path) => location.pathname.startsWith(path),
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
            path="/candidate"
            element={
              <ProtectedRoute allowedRoles={["Candidate", "candidate"]}>
                <CandidatePortal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter"
            element={
              <ProtectedRoute allowedRoles={["Recruiter", "recruiter"]}>
                <RecruiterDashboard />
              </ProtectedRoute>
            }
          />
          
          {/* Inside <Routes> */}
          <Route
            path="/interview/:jobId/:resumeId"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "Candidate",
                  "candidate",
                  "Recruiter",
                  "recruiter",
                ]}
              >
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
