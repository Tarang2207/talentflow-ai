// client/src/pages/RecruiterDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import API from "../api/axios";
import {
  Home as HomeIcon,
  Briefcase,
  Bot,
  Sparkles,
  LogOut,
  CheckCircle2,
  AlertCircle,
  X,
  Users,
  ChevronDown,
} from "lucide-react";

export default function RecruiterDashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    company: "TechCorp Solutions",
    skillsRequired: "",
    description: "",
  });

  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [matchResults, setMatchResults] = useState([]);
  const [publishing, setPublishing] = useState(false);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [statusMsg, setStatusMsg] = useState(null);

  const fetchJobs = async () => {
    try {
      const { data } = await API.get("/jobs");
      setJobs(data);
      if (data.length > 0 && !selectedJob) {
        setSelectedJob(data[0]);
      }
    } catch (err) {
      console.error("Error fetching jobs:", err);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (!selectedJob || selectedJob._id === "default-demo-job") {
      setMatchResults([
        {
          _id: "cand-1",
          candidate: { name: "Aarav Mehta", email: "aarav@example.com" },
          extractedSkills: ["React", "Node.js", "MongoDB"],
          matchPercentage: 92,
          rawText:
            "Experienced Full Stack Developer with expertise in React, Node.js, Express, and MongoDB Atlas.",
        },
        {
          _id: "cand-2",
          candidate: { name: "Priya Nair", email: "priya@example.com" },
          extractedSkills: ["React", "Express", "Tailwind"],
          matchPercentage: 87,
          rawText:
            "Frontend heavy engineer with strong experience in React, Tailwind CSS, and Node API integration.",
        },
        {
          _id: "cand-3",
          candidate: { name: "Rohan Iyer", email: "rohan@example.com" },
          extractedSkills: ["Node.js", "MongoDB"],
          matchPercentage: 74,
          rawText:
            "Backend developer focused on Node.js REST APIs, database indexing, and microservices.",
        },
      ]);
      return;
    }

    const fetchMatches = async () => {
      setLoadingMatches(true);
      try {
        const { data } = await API.get(`/match/job-resumes/${selectedJob._id}`);
        setMatchResults(data.matches || []);
      } catch (err) {
        console.error("Error fetching vector matches:", err);
        setMatchResults([]);
      } finally {
        setLoadingMatches(false);
      }
    };

    fetchMatches();
  }, [selectedJob]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePublishJob = async (e) => {
    e.preventDefault();
    setPublishing(true);
    setStatusMsg(null);

    try {
      const payload = {
        title: formData.title,
        company: formData.company,
        description: formData.description,
        skillsRequired: formData.skillsRequired
          ? formData.skillsRequired.split(",").map((s) => s.trim())
          : [],
      };

      const { data } = await API.post("/jobs", payload);
      setStatusMsg({
        type: "success",
        text: "Opening published & vector indexed successfully!",
      });

      setFormData({
        title: "",
        company: "TechCorp Solutions",
        skillsRequired: "",
        description: "",
      });

      await fetchJobs();
      if (data.job) {
        setSelectedJob(data.job);
      }
    } catch (err) {
      console.error("Job publication error:", err);
      setStatusMsg({
        type: "error",
        text: err.response?.data?.message || "Failed to publish job opening",
      });
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      {/* ------------------ LEFT SIDEBAR ------------------ */}
      <aside className="w-64 bg-[#0B0F19] text-slate-300 flex flex-col justify-between p-6 shrink-0 hidden md:flex">
        <div>
          <Link to="/" className="flex items-center space-x-3 mb-10">
            <div className="h-9 w-9 rounded-xl bg-[#4F46E5] flex items-center justify-center text-white font-black text-xl shadow-md">
              🤖
            </div>
            <span className="text-white font-bold text-xl tracking-tight">
              TalentFlow AI
            </span>
          </Link>

          <nav className="space-y-2">
            <button
              onClick={() => navigate("/")}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium text-sm transition"
            >
              <HomeIcon className="h-5 w-5" />
              <span>Back to Home</span>
            </button>

            <button
              onClick={() => navigate("/recruiter")}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-[#4F46E5] text-white font-semibold text-sm transition"
            >
              <Briefcase className="h-5 w-5" />
              <span>Recruiter Dashboard</span>
            </button>

            <button
              onClick={() =>
                navigate(
                  `/interview/${selectedJob?._id || "default-job"}/demo-resume`,
                )
              }
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium text-sm transition"
            >
              <Bot className="h-5 w-5" />
              <span>AI Assessment</span>
            </button>
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="h-9 w-9 rounded-full bg-[#4F46E5] text-white font-bold flex items-center justify-center text-sm shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : "R"}
            </div>
            <div className="truncate">
              <p className="text-sm font-semibold text-white truncate">
                {user?.name || "Recruiter"}
              </p>
              <p className="text-xs text-slate-400 capitalize">
                {user?.role || "Recruiter"}
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
              Recruiter Dashboard
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Post jobs and review vector-search candidate matches.
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

        {statusMsg && (
          <div
            className={`mb-6 p-4 rounded-2xl border text-sm flex items-center justify-between ${
              statusMsg.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : "bg-rose-50 border-rose-200 text-rose-900"
            }`}
          >
            <div className="flex items-center space-x-2">
              {statusMsg.type === "success" ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
              )}
              <span className="font-semibold">{statusMsg.text}</span>
            </div>
            <button
              onClick={() => setStatusMsg(null)}
              className="p-1 hover:opacity-75"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 lg:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-5">
              <h2 className="text-lg font-bold text-[#0F172A]">
                Post new opening
              </h2>

              <form onSubmit={handlePublishJob} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Job title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Senior Frontend Engineer"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Required skills
                  </label>
                  <input
                    type="text"
                    name="skillsRequired"
                    value={formData.skillsRequired}
                    onChange={handleChange}
                    placeholder="React, Node.js, Vector Search"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Paste the full job details..."
                    className="w-full p-3 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={publishing}
                  className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold py-3 px-4 rounded-xl transition shadow-sm text-sm disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>
                    {publishing ? "Generating Embedding..." : "Publish & index"}
                  </span>
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">
                      Active Opening
                    </span>
                    {jobs.length > 1 && (
                      <div className="relative inline-block">
                        <select
                          value={selectedJob?._id || ""}
                          onChange={(e) => {
                            const found = jobs.find(
                              (j) => j._id === e.target.value,
                            );
                            if (found) setSelectedJob(found);
                          }}
                          className="text-xs font-semibold text-slate-600 bg-slate-100 rounded-md px-2 py-0.5 pr-6 appearance-none focus:outline-none cursor-pointer"
                        >
                          {jobs.map((j) => (
                            <option key={j._id} value={j._id}>
                              Switch Job ({j.title})
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="h-3 w-3 text-slate-500 absolute right-1.5 top-1 pointer-events-none" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-[#0F172A]">
                    {selectedJob
                      ? selectedJob.title
                      : "Full Stack MERN Developer"}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {selectedJob?.company || "TechCorp Solutions"}
                  </p>
                </div>

                <span className="bg-[#EEF2FF] text-[#4F46E5] text-xs font-semibold px-3 py-1 rounded-full border border-[#E0E7FF] shrink-0">
                  Vector index active
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                {selectedJob?.description ||
                  "Looking for a developer with Node.js, Express, React, and MongoDB experience."}
              </p>

              <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-50">
                {selectedJob?.skillsRequired &&
                selectedJob.skillsRequired.length > 0
                  ? selectedJob.skillsRequired.map((skill, idx) => (
                      <span
                        key={idx}
                        className="bg-[#EEF2FF] text-[#4F46E5] text-xs font-semibold px-2.5 py-1 rounded-lg"
                      >
                        {skill}
                      </span>
                    ))
                  : ["React", "Node.js", "MongoDB", "Express", "Tailwind"].map(
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

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[#0F172A]">
                Match leaderboard
              </h2>

              {loadingMatches ? (
                <div className="p-8 bg-white rounded-3xl border border-slate-100 text-center">
                  <p className="text-slate-400 text-sm">
                    Querying MongoDB $vectorSearch Index...
                  </p>
                </div>
              ) : matchResults.length === 0 ? (
                <div className="p-8 bg-white rounded-3xl border border-slate-100 text-center space-y-2">
                  <Users className="h-8 w-8 text-slate-300 mx-auto" />
                  <p className="text-sm font-bold text-slate-700">
                    No Candidate Matches Found Yet
                  </p>
                  <p className="text-xs text-slate-400">
                    When candidates upload resumes for this role, vector matches
                    will appear here automatically.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {matchResults.map((match, idx) => {
                    const score =
                      match.matchPercentage ||
                      Math.round((match.score || 0.85) * 100);
                    const candidateName =
                      match.candidate?.name || `Candidate #${idx + 1}`;
                    const avatarInitial = candidateName.charAt(0).toUpperCase();

                    let scoreBadgeClass = "bg-[#ECFDF5] text-[#059669]";
                    if (score < 80)
                      scoreBadgeClass = "bg-[#FFFBEB] text-[#D97706]";
                    if (score < 60)
                      scoreBadgeClass = "bg-[#FEF2F2] text-[#DC2626]";

                    return (
                      <div
                        key={match._id || idx}
                        className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between hover:border-slate-200 transition"
                      >
                        <div className="flex items-center space-x-4 min-w-0">
                          <span className="text-sm font-black text-[#4F46E5] w-6 shrink-0">
                            #{idx + 1}
                          </span>

                          <div className="h-10 w-10 rounded-full bg-[#4F46E5] text-white font-bold flex items-center justify-center text-sm shrink-0">
                            {avatarInitial}
                          </div>

                          <div className="min-w-0">
                            <h4 className="font-bold text-sm text-[#0F172A] truncate">
                              {candidateName}
                            </h4>
                            <p className="text-xs text-slate-500 truncate mt-0.5">
                              {match.extractedSkills &&
                              match.extractedSkills.length > 0
                                ? match.extractedSkills.join(" · ")
                                : "React · Node.js · MongoDB"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 shrink-0 ml-4">
                          <span
                            className={`text-xs font-bold px-3 py-1 rounded-full ${scoreBadgeClass}`}
                          >
                            {score}%
                          </span>

                          <button
                            onClick={() => setSelectedCandidate(match)}
                            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold px-4 py-2 rounded-xl transition shadow-sm"
                          >
                            View
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {selectedCandidate && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-3xl p-6 lg:p-8 shadow-xl border border-slate-100 relative space-y-4">
            <button
              onClick={() => setSelectedCandidate(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-full bg-[#4F46E5] text-white font-bold flex items-center justify-center text-lg">
                {(selectedCandidate.candidate?.name || "C")
                  .charAt(0)
                  .toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0F172A]">
                  {selectedCandidate.candidate?.name || "Candidate Profile"}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedCandidate.candidate?.email || "N/A"}
                </p>
              </div>
            </div>

            <div className="bg-[#EEF2FF] p-4 rounded-2xl flex items-center justify-between">
              <span className="text-xs font-semibold text-[#4F46E5]">
                Vector Similarity Match
              </span>
              <span className="text-sm font-extrabold text-[#4F46E5]">
                {selectedCandidate.matchPercentage || 87}%
              </span>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-700 mb-1">
                Resume Text Snippet:
              </h4>
              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 max-h-40 overflow-y-auto leading-relaxed">
                {selectedCandidate.rawText ||
                  "PDF text parsed and indexed cleanly."}
              </p>
            </div>

            <button
              onClick={() => setSelectedCandidate(null)}
              className="w-full bg-slate-900 text-white font-semibold py-2.5 rounded-xl text-xs hover:bg-slate-800 transition"
            >
              Close Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
