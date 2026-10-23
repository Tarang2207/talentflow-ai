// client/src/pages/RecruiterDashboard.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

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
  Award,
  Search,
  Edit3,
  Plus,
  Trash2,
  FileText,
  Eye,
  ExternalLink,
  Download,
} from "lucide-react";

export default function RecruiterDashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    company: "TechCorp Solutions",
    skillsRequired: "",
    description: "",
  });

  // Data & UI State
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [matchResults, setMatchResults] = useState([]);
  const [publishing, setPublishing] = useState(false);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [statusMsg, setStatusMsg] = useState(null);
  // Question Management State
  const [showQuestionsModal, setShowQuestionsModal] = useState(false);
  const [editedQuestions, setEditedQuestions] = useState([]);
  const [savingQuestions, setSavingQuestions] = useState(false);
  // Resume Modal State
  const [viewingResume, setViewingResume] = useState(null);
  const [fetchingResume, setFetchingResume] = useState(false);

  // client/src/pages/RecruiterDashboard.jsx

  const handleViewResume = async (candidate) => {
    console.log("Leaderboard Candidate Item:", candidate);

    try {
      const token = localStorage.getItem("token");
      const axiosConfig = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};

      let targetId =
        typeof candidate === "string"
          ? candidate
          : candidate?.user_id ||
            candidate?.candidate_id ||
            candidate?.userId ||
            candidate?.applicantId ||
            (typeof candidate?.user === "object"
              ? candidate?.user?._id
              : candidate?.user) ||
            (typeof candidate?.applicant === "object"
              ? candidate?.applicant?._id
              : candidate?.applicant) ||
            candidate?._id;

      if (!targetId) return;

      let responseData = null;

      try {
        const res = await axios.get(
          `http://localhost:5001/api/resumes/user/${targetId}`,
          axiosConfig,
        );
        responseData = res.data;
      } catch (err) {
        try {
          const res = await axios.get(
            `http://localhost:5001/api/resumes/${targetId}`,
            axiosConfig,
          );
          responseData = res.data;
        } catch (err2) {
          console.warn("Resume lookups failed for ID:", targetId);
        }
      }

      if (responseData) {
        console.log("Resume Data received from API:", responseData);

        // Prioritize Multer disk path (filePath) over original fileName
        const rawPath =
          responseData.filePath || `uploads/${responseData.fileName}`;
        const cleanPath = rawPath.replace(/\\/g, "/").replace(/^\/+/, "");

        setViewingResume({
          ...responseData,
          fileUrl: `http://localhost:5001/${cleanPath}`,
        });
      } else {
        setViewingResume({
          fileName: null,
          rawText: `No resume document on file in database matching ID (${targetId}).`,
          extractedSkills: candidate?.skills || [],
        });
      }
    } catch (error) {
      console.error("Error retrieving candidate resume:", error);
    }
  };

  // Handler Function
  const handleOpenQuestionsModal = () => {
    if (!selectedJob) return;
    const currentQuestions =
      selectedJob.customQuestions?.length > 0
        ? selectedJob.customQuestions
        : [
            "Explain the key differences between SQL and NoSQL databases in MERN applications.",
            "How do you manage global state using Zustand or Redux in React?",
            "What strategies do you use to optimize Express REST API endpoints?",
          ];
    setEditedQuestions([...currentQuestions]);
    setShowQuestionsModal(true);
  };

  const handleQuestionChange = (index, value) => {
    const updated = [...editedQuestions];
    updated[index] = value;
    setEditedQuestions(updated);
  };

  const handleAddQuestion = () => {
    setEditedQuestions([...editedQuestions, ""]);
  };

  const handleRemoveQuestion = (index) => {
    setEditedQuestions(editedQuestions.filter((_, i) => i !== index));
  };

  const handleSaveQuestions = async () => {
    if (!selectedJob?._id) return;
    try {
      setSavingQuestions(true);
      const cleanedQuestions = editedQuestions.filter(
        (q) => q.trim().length > 0,
      );

      const { data } = await API.put(`/jobs/${selectedJob._id}`, {
        customQuestions: cleanedQuestions,
      });

      setStatusMsg({
        type: "success",
        text: "AI Assessment questions updated successfully!",
      });

      if (data.job) {
        setSelectedJob(data.job);
      }
      setShowQuestionsModal(false);
      await fetchJobs();
    } catch (err) {
      console.error("Error saving questions:", err);
      setStatusMsg({
        type: "error",
        text:
          err.response?.data?.message ||
          "Failed to update assessment questions",
      });
    } finally {
      setSavingQuestions(false);
    }
  };
  // END OF HANDLER FUNCTION

  // 1. Fetch Job Openings
  const fetchJobs = async () => {
    try {
      const { data } = await API.get("/jobs");
      if (Array.isArray(data) && data.length > 0) {
        setJobs(data);
        setSelectedJob((currentSelected) => {
          if (
            currentSelected &&
            data.some((j) => j._id === currentSelected._id)
          ) {
            return currentSelected;
          }
          return data[0];
        });
      }
    } catch (err) {
      console.warn("Error fetching jobs:", err.message);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // 2. Fetch Candidate Matches
  useEffect(() => {
    const fetchMatches = async () => {
      setLoadingMatches(true);
      const targetJobId = selectedJob?._id || "default-job";

      try {
        const { data } = await API.get(`/match/job-resumes/${targetJobId}`);
        console.log("Leaderboard API Response:", data);

        if (data && Array.isArray(data.matches)) {
          setMatchResults(data.matches);
        } else {
          setMatchResults([]);
        }
      } catch (err) {
        console.error(
          "Error fetching leaderboard matches:",
          err.response?.data || err.message,
        );
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

  // 3. Publish New Job Opening
  const handlePublishJob = async (e) => {
    e.preventDefault();
    setPublishing(true);
    setStatusMsg(null);

    try {
      const payload = {
        title: formData.title,
        company: formData.company || "TechCorp Solutions",
        description: formData.description,
        skillsRequired: formData.skillsRequired || "",
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

      const newJob = data.job || data;
      if (newJob && newJob._id) {
        setSelectedJob(newJob);
      }

      await fetchJobs();
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

  {
    /* Helper function placed right above return () in RecruiterDashboard.jsx */
  }

  const getResumeUrl = (resume) => {
    if (!resume) return "";

    // Prioritize filePath (the actual disk filename saved by Multer) over fileName
    const targetPath = resume.filePath || `uploads/${resume.fileName}`;

    // Replace Windows backslashes (\) with web slashes (/) and remove leading slashes
    const cleanPath = targetPath.replace(/\\/g, "/").replace(/^\/+/, "");

    // Ensure the URL ends with .pdf
    const finalPath = cleanPath.endsWith(".pdf")
      ? cleanPath
      : `${cleanPath}.pdf`;

    return `http://localhost:5001/${finalPath}`;
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      {/* LEFT SIDEBAR */}
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

            {/* LOGICAL RECRUITER PREVIEW BUTTON */}
            <button
              onClick={() =>
                navigate(
                  `/interview/${selectedJob?._id || "default-job"}/demo-resume`,
                )
              }
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium text-sm transition text-left group"
              title={`Preview AI assessment questions for ${selectedJob?.title || "Active Job"}`}
            >
              <Bot className="h-5 w-5 text-indigo-400 group-hover:scale-110 transition-transform shrink-0" />
              <div className="truncate">
                <span className="block text-sm font-semibold text-slate-300 group-hover:text-white truncate">
                  Preview AI Test
                </span>
                <span className="block text-[10px] text-slate-500 truncate font-normal">
                  {selectedJob ? selectedJob.title : "Default Opening"}
                </span>
              </div>
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

      {/* MAIN CONTENT AREA */}
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
          {/* Post Opening Form */}
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

          {/* Active Job Card + Match Leaderboard */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">
                      Active Opening
                    </span>

                    {jobs.length > 0 && (
                      <div className="relative inline-block">
                        <select
                          value={selectedJob?._id || ""}
                          onChange={(e) => {
                            const found = jobs.find(
                              (j) => j._id === e.target.value,
                            );
                            if (found) setSelectedJob(found);
                          }}
                          className="text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 pr-7 appearance-none focus:outline-none cursor-pointer"
                        >
                          {jobs.map((j) => (
                            <option key={j._id} value={j._id}>
                              Switch: {j.title}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="h-3.5 w-3.5 text-slate-500 absolute right-2 top-1.5 pointer-events-none" />
                      </div>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-[#0F172A] pt-1">
                    {selectedJob
                      ? selectedJob.title
                      : "Full Stack MERN Developer"}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {selectedJob?.company || "TechCorp Solutions"}
                  </p>
                </div>

                <span className="bg-[#EEF2FF] text-[#4F46E5] text-xs font-semibold px-3 py-1 rounded-full border border-[#E0E7FF] shrink-0">
                  Vector index active
                </span>
              </div>

              <p className="text-xs text-[#475569] leading-relaxed line-clamp-3">
                {selectedJob?.description ||
                  "Looking for a developer with Node.js, Express, React, and MongoDB experience."}
              </p>

              {/* PREVIEW ASSESSMENT BUTTON FOR ACTIVE JOB */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-500">
                  Screening candidate technical competency
                </span>
                <button
                  onClick={() =>
                    navigate(
                      `/interview/${selectedJob?._id || "default-job"}/demo-resume`,
                    )
                  }
                  className="bg-indigo-50 hover:bg-indigo-100/80 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-xl border border-indigo-200/80 transition flex items-center space-x-1.5"
                >
                  <Bot className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Preview Role Test</span>
                </button>

                <button
                  onClick={handleOpenQuestionsModal}
                  className="bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 transition shadow-sm flex items-center space-x-1.5"
                >
                  <Edit3 className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Edit Questions</span>
                </button>
              </div>
            </div>

            {/* Match Leaderboard Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[#0F172A]">
                Match leaderboard
              </h2>

              {loadingMatches ? (
                <div className="p-8 bg-white rounded-3xl border border-slate-100 text-center">
                  <p className="text-slate-400 text-sm">
                    Querying candidate vector matches...
                  </p>
                </div>
              ) : matchResults.length === 0 ? (
                <div className="bg-white p-10 rounded-3xl border border-slate-100 text-center space-y-3">
                  <Users className="h-10 w-10 text-slate-300 mx-auto" />
                  <h3 className="text-sm font-bold text-slate-700">
                    No Candidate Matches Found Yet
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    When candidates complete an AI assessment or upload a resume
                    for this role, their real score and name will appear here
                    automatically.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {matchResults.map((match, idx) => {
                    const score = match.matchPercentage || 88;
                    const candidateName = match.candidate?.name || "Candidate";
                    const avatarInitial = candidateName.charAt(0).toUpperCase();

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
                              {Array.isArray(match.extractedSkills) &&
                              match.extractedSkills.length > 0
                                ? match.extractedSkills.join(" · ")
                                : "React · Node.js · MongoDB"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0 ml-4">
                          <span className="text-xs font-bold bg-[#ECFDF5] text-[#059669] px-3 py-1 rounded-full border border-emerald-100">
                            {score}% Match
                          </span>

                          {match.interviewScore !== null &&
                          match.interviewScore !== undefined ? (
                            <span className="text-xs font-bold bg-[#EEF2FF] text-[#4F46E5] px-3 py-1 rounded-full border border-indigo-100 flex items-center space-x-1">
                              <Award className="h-3 w-3 inline" />
                              <span>{match.interviewScore}% AI</span>
                            </span>
                          ) : (
                            <span className="text-xs font-medium bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full">
                              No Interview
                            </span>
                          )}

                          <button
                            onClick={() => setSelectedCandidate(match)}
                            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold px-3 py-1.5 rounded-xl transition shadow-sm ml-1"
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

      {/* Candidate Profile Modal */}
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

              {/* --- PASTE THIS CODE BELOW CANDIDATE INFO DIV --- */}
              <div className="flex items-center space-x-3">
                <div className="bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-xl text-center">
                  <span className="text-[9px] font-bold text-indigo-500 uppercase block tracking-wider">
                    AI Score
                  </span>
                  <span className="text-xs font-extrabold text-indigo-700">
                    {selectedCandidate.interviewScore ||
                      selectedCandidate.matchPercentage ||
                      85}
                    %
                  </span>
                </div>

                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                    (selectedCandidate.interviewScore ||
                      selectedCandidate.matchPercentage ||
                      85) >= 80
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {(selectedCandidate.interviewScore ||
                    selectedCandidate.matchPercentage ||
                    85) >= 80
                    ? "Top Match"
                    : "Reviewed"}
                </span>
              </div>
              {/* --- END OF NEW CODE --- */}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#ECFDF5] p-3.5 rounded-2xl border border-emerald-100">
                <span className="text-xs font-semibold text-[#059669] block">
                  Vector Match
                </span>
                <span className="text-lg font-extrabold text-[#059669]">
                  {selectedCandidate.matchPercentage || 88}% Match
                </span>
              </div>

              <div className="bg-[#EEF2FF] p-3.5 rounded-2xl border border-indigo-100">
                <span className="text-xs font-semibold text-[#4F46E5] block">
                  AI Screening Score
                </span>
                <span className="text-lg font-extrabold text-[#4F46E5]">
                  {selectedCandidate.interviewScore
                    ? `${selectedCandidate.interviewScore}% Score`
                    : "Pending"}
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-700 mb-1">
                Resume Snippet:
              </h4>
              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 max-h-36 overflow-y-auto leading-relaxed">
                {selectedCandidate.rawText ||
                  "Resume parsed and indexed cleanly."}
              </p>
            </div>

            <button
              onClick={() =>
                handleViewResume(
                  selectedCandidate.resumeId ||
                    selectedCandidate.resume?._id ||
                    selectedCandidate._id,
                  selectedCandidate,
                )
              }
              disabled={fetchingResume}
              className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold py-2.5 rounded-xl text-xs transition shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Eye className="h-4 w-4" />
              <span>
                {fetchingResume
                  ? "Loading Resume..."
                  : "View Full Candidate Resume"}
              </span>
            </button>

            <button
              onClick={() => setSelectedCandidate(null)}
              className="w-full bg-slate-900 text-white font-semibold py-2.5 rounded-xl text-xs hover:bg-slate-800 transition"
            >
              Close Profile
            </button>
          </div>
        </div>
      )}

      {/* EDIT ASSESSMENT QUESTIONS MODAL */}
      {showQuestionsModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full rounded-3xl p-6 lg:p-8 shadow-xl border border-slate-100 relative space-y-6 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
              <div>
                <h3 className="text-lg font-bold text-[#0F172A]">
                  Edit AI Assessment Questions
                </h3>
                <p className="text-xs text-slate-500">
                  Role:{" "}
                  <span className="font-semibold text-indigo-600">
                    {selectedJob?.title}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setShowQuestionsModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto flex-1 pr-1">
              {editedQuestions.map((qText, idx) => (
                <div
                  key={idx}
                  className="flex items-start space-x-3 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80"
                >
                  <span className="text-xs font-bold text-indigo-600 mt-2.5 w-5 shrink-0">
                    Q{idx + 1}.
                  </span>
                  <textarea
                    rows={2}
                    value={qText}
                    onChange={(e) => handleQuestionChange(idx, e.target.value)}
                    placeholder="Enter technical question text..."
                    className="flex-1 p-3 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white resize-none"
                  />
                  <button
                    onClick={() => handleRemoveQuestion(idx)}
                    className="text-slate-400 hover:text-rose-600 p-2 rounded-lg transition shrink-0 mt-1"
                    title="Delete Question"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}

              <button
                onClick={handleAddQuestion}
                className="w-full py-3 border-2 border-dashed border-indigo-200 hover:border-indigo-400 text-indigo-600 rounded-2xl text-xs font-semibold transition flex items-center justify-center space-x-2 bg-indigo-50/30"
              >
                <Plus className="h-4 w-4" />
                <span>Add New Assessment Question</span>
              </button>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3 shrink-0">
              <button
                onClick={() => setShowQuestionsModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveQuestions}
                disabled={savingQuestions}
                className="px-5 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold transition shadow-sm disabled:opacity-50"
              >
                {savingQuestions
                  ? "Saving Changes..."
                  : "Save Assessment Questions"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL RESUME VIEWER MODAL */}
      {/* FULL RESUME VIEWER MODAL */}
      {viewingResume && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-3xl w-full rounded-3xl p-6 lg:p-8 shadow-xl border border-slate-100 relative space-y-5 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0F172A]">
                    {viewingResume?.fileName || "Candidate Resume"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Parsed Document & Vector Index
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* OPEN ORIGINAL PDF IN NEW TAB */}
                {viewingResume?.fileUrl && (
                  <a
                    href={viewingResume.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold px-3.5 py-2 rounded-xl text-xs transition border border-indigo-200/80 flex items-center space-x-1.5"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Open Original PDF</span>
                  </a>
                )}

                <button
                  onClick={() => setViewingResume(null)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Extracted Key Skills */}
            {viewingResume?.extractedSkills &&
              viewingResume.extractedSkills.length > 0 && (
                <div className="shrink-0">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                    Parsed Key Skills
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {viewingResume.extractedSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg text-xs font-semibold border border-indigo-100"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {/* Embedded PDF Preview / Raw Text Fallback */}
            <div className="flex-1 overflow-y-auto bg-slate-50 p-4 rounded-2xl border border-slate-200/80 font-mono text-xs text-slate-700 leading-relaxed min-h-[250px]">
              {viewingResume?.fileUrl ? (
                <iframe
                  src={viewingResume.fileUrl}
                  title="Candidate Resume PDF"
                  className="w-full h-96 rounded-xl border-none"
                />
              ) : (
                <div className="whitespace-pre-wrap">
                  {viewingResume?.rawText ||
                    "No raw text available for this document."}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end space-x-3 shrink-0">
              <button
                onClick={() => setViewingResume(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-5 py-2.5 rounded-xl text-xs transition"
              >
                Close Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
