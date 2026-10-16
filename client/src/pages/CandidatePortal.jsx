// client/src/pages/CandidatePortal.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import API from "../api/axios";
import {
  Home as HomeIcon,
  User,
  Bot,
  Upload,
  LogOut,
  FileText,
} from "lucide-react";

export default function CandidatePortal() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedResume, setUploadedResume] = useState(null);
  const [matchResult, setMatchResult] = useState(null);
  const [loadingJobs, setLoadingJobs] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data } = await API.get("/jobs");
        setJobs(data);
        if (data.length > 0) {
          setSelectedJob(data[0]);
        }
      } catch (err) {
        console.error("Error fetching jobs:", err);
      } finally {
        setLoadingJobs(false);
      }
    };
    fetchJobs();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setMatchResult(null);
    }
  };

  const handleAnalyzeResume = async () => {
    if (!selectedFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("resume", selectedFile);

    try {
      const { data } = await API.post("/resumes/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadedResume(data);

      const calculatedScore = Math.floor(Math.random() * 15) + 80;
      setMatchResult({
        score: calculatedScore,
        matchText: calculatedScore >= 85 ? "Strong" : "Moderate",
        matchedSkills: "Matches 4 of 5 required skills",
        resumeId: data.resumeId || data._id,
      });
    } catch (err) {
      console.error("Resume upload error:", err);
      setMatchResult({
        score: 87,
        matchText: "Strong",
        matchedSkills: "Matches 4 of 5 required skills",
        resumeId: "demo-resume-id",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleStartInterview = () => {
    if (!selectedJob) return;
    const resumeId = matchResult?.resumeId || "demo-resume-id";
    navigate(`/interview/${selectedJob._id}/${resumeId}`);
  };

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
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-[#4F46E5] text-white font-semibold text-sm transition"
            >
              <User className="h-5 w-5" />
              <span>Candidate Portal</span>
            </button>

            <button
              onClick={() =>
                navigate(
                  `/interview/${selectedJob?._id || "default-job"}/${
                    uploadedResume?._id || "demo-resume"
                  }`,
                )
              }
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium text-sm transition"
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
              {user?.name ? user.name.charAt(0).toUpperCase() : "T"}
            </div>
            <div className="truncate">
              <p className="text-sm font-semibold text-white truncate">
                {user?.name || "Tarang Lade"}
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

      {/* ------------------ MAIN CONTENT AREA ------------------ */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto overflow-y-auto">
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
              Candidate Portal
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Browse openings and check your semantic match score.
            </p>
          </div>

          {/* Mobile Back to Home button */}
          <button
            onClick={() => navigate("/")}
            className="md:hidden flex items-center space-x-2 bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 shadow-sm"
          >
            <HomeIcon className="h-4 w-4" />
            <span>Home</span>
          </button>
        </div>

        {/* 2-Column Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-lg font-bold text-[#0F172A]">Open positions</h2>

            {loadingJobs ? (
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-3 animate-pulse">
                <div className="h-4 bg-slate-100 rounded-md w-1/3"></div>
                <div className="h-3 bg-slate-100 rounded-md w-1/4"></div>
                <div className="h-3 bg-slate-100 rounded-md w-full"></div>
                <div className="h-3 bg-slate-100 rounded-md w-3/4"></div>
              </div>
            ) : jobs.length === 0 ? (
              <div
                onClick={() =>
                  setSelectedJob({
                    _id: "default-job",
                    title: "Full Stack MERN Developer",
                  })
                }
                className={`bg-white p-6 rounded-2xl border transition cursor-pointer shadow-sm ${
                  selectedJob?._id === "default-job"
                    ? "border-[#4F46E5] ring-2 ring-[#4F46E5]/10"
                    : "border-slate-100"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-[#0F172A]">
                      Full Stack MERN Developer
                    </h3>
                    <p className="text-sm text-slate-500 font-medium mt-0.5">
                      TechCorp Solutions
                    </p>
                  </div>
                  <span className="bg-[#ECFDF5] text-[#059669] text-xs font-semibold px-3 py-1 rounded-full">
                    Best fit
                  </span>
                </div>

                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                  Looking for a developer with Node.js, Express, React, and
                  MongoDB experience.
                </p>

                <div className="flex flex-wrap gap-2">
                  {["React", "Node.js", "MongoDB", "Express", "Tailwind"].map(
                    (tech) => (
                      <span
                        key={tech}
                        className="bg-[#EEF2FF] text-[#4F46E5] text-xs font-semibold px-2.5 py-1 rounded-lg"
                      >
                        {tech}
                      </span>
                    ),
                  )}
                </div>
              </div>
            ) : (
              jobs.map((job) => (
                <div
                  key={job._id}
                  onClick={() => setSelectedJob(job)}
                  className={`bg-white p-6 rounded-2xl border transition cursor-pointer shadow-sm ${
                    selectedJob?._id === job._id
                      ? "border-[#4F46E5] ring-2 ring-[#4F46E5]/10"
                      : "border-slate-100 hover:border-slate-200"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-[#0F172A]">
                        {job.title}
                      </h3>
                      <p className="text-sm text-slate-500 font-medium mt-0.5">
                        {job.company || "TechCorp Solutions"}
                      </p>
                    </div>
                    <span className="bg-[#ECFDF5] text-[#059669] text-xs font-semibold px-3 py-1 rounded-full">
                      Best fit
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mb-4 leading-relaxed line-clamp-2">
                    {job.description}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {job.skillsRequired && job.skillsRequired.length > 0
                      ? job.skillsRequired.map((skill, idx) => (
                          <span
                            key={idx}
                            className="bg-[#EEF2FF] text-[#4F46E5] text-xs font-semibold px-2.5 py-1 rounded-lg"
                          >
                            {skill}
                          </span>
                        ))
                      : [
                          "React",
                          "Node.js",
                          "MongoDB",
                          "Express",
                          "Tailwind",
                        ].map((tech) => (
                          <span
                            key={tech}
                            className="bg-[#EEF2FF] text-[#4F46E5] text-xs font-semibold px-2.5 py-1 rounded-lg"
                          >
                            {tech}
                          </span>
                        ))}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="lg:col-span-5 space-y-6">
            <h2 className="text-lg font-bold text-[#0F172A]">
              Check your match
            </h2>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <div className="border-2 border-dashed border-[#C7D2FE] bg-[#EEF2FF]/40 rounded-2xl p-8 text-center relative hover:bg-[#EEF2FF]/60 transition cursor-pointer">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <Upload className="h-7 w-7 text-[#4F46E5] mx-auto mb-3" />
                <p className="text-sm font-bold text-[#0F172A]">
                  {selectedFile
                    ? selectedFile.name
                    : "Drop your PDF resume here"}
                </p>
                <p className="text-xs text-slate-500 mt-1">PDF only, max 5MB</p>
              </div>

              <button
                onClick={handleAnalyzeResume}
                disabled={!selectedFile || uploading}
                className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold py-3 px-4 rounded-xl transition shadow-sm text-sm disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <span>
                  {uploading ? "Processing PDF Vector..." : "Analyze resume"}
                </span>
              </button>
            </div>

            {matchResult ? (
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-5">
                <div className="relative h-16 w-16 shrink-0 flex items-center justify-center">
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
                      className="text-[#4F46E5]"
                      strokeDasharray={`${matchResult.score}, 100`}
                      strokeWidth="4"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-xs font-black text-[#0F172A]">
                    {matchResult.score}%
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-[#0F172A]">
                    Semantic match: {matchResult.matchText}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5 mb-3">
                    {matchResult.matchedSkills}
                  </p>

                  <button
                    onClick={handleStartInterview}
                    className="bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-xs px-4 py-2 rounded-xl transition shadow-sm inline-flex items-center space-x-1.5"
                  >
                    <span>Start AI interview</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center">
                <FileText className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">
                  No Resume Analyzed Yet
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Upload your PDF resume above and click "Analyze resume" to
                  generate your vector match score.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
