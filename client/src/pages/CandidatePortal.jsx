// client/src/pages/CandidatePortal.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import API from "../api/axios";
import {
  Home,
  UploadCloud,
  FileText,
  Bot,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  ArrowRight,
} from "lucide-react";

export default function CandidatePortal() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);
  const [myResume, setMyResume] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  // Fetch candidate's uploaded resume & available job openings
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: resumeData } = await API.get("/resumes/my-resume");
        setMyResume(resumeData);
      } catch (err) {
        console.warn("No active resume found:", err.message);
      }

      try {
        setLoadingJobs(true);
        const { data: jobsData } = await API.get("/jobs");
        if (Array.isArray(jobsData)) {
          setJobs(jobsData);
        }
      } catch (err) {
        console.warn("Error fetching jobs:", err.message);
      } finally {
        setLoadingJobs(false);
      }
    };

    fetchData();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadResume = async (e) => {
    e.preventDefault();
    if (!file) {
      setStatusMsg({
        type: "error",
        text: "Please select a resume file first.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    try {
      setUploading(true);
      setStatusMsg(null);
      const { data } = await API.post("/resumes/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setStatusMsg({
        type: "success",
        text: "Resume uploaded and parsed successfully!",
      });
      if (data.resume) {
        setMyResume(data.resume);
      }
    } catch (err) {
      console.error("Resume Upload Error:", err);
      setStatusMsg({
        type: "error",
        text: err.response?.data?.message || "Failed to upload resume",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      {/* TOP NAVIGATION BAR */}
      <header className="bg-[#0B0F19] text-white px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link to="/" className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-[#4F46E5] flex items-center justify-center text-white font-black text-xl shadow-md">
              🤖
            </div>
            <span className="text-white font-bold text-xl tracking-tight">
              TalentFlow AI
            </span>
          </Link>

          {/* BACK TO HOME BUTTON */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-xs transition border border-slate-700/50"
          >
            <Home className="h-4 w-4 text-indigo-400" />
            <span>Back to Home</span>
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-[#4F46E5] text-white font-bold flex items-center justify-center text-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : "C"}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-white">
                {user?.name || "Candidate"}
              </p>
              <p className="text-[10px] text-slate-400 capitalize">
                {user?.role || "Candidate"}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="text-slate-400 hover:text-rose-400 p-2 rounded-lg transition"
            title="Log Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-10 space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Candidate Portal
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Upload your resume and complete AI screening assessments.
          </p>
        </div>

        {statusMsg && (
          <div
            className={`p-4 rounded-2xl border text-sm flex items-center justify-between ${
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
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* RESUME UPLOAD SECTION */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center space-x-2">
                <UploadCloud className="h-5 w-5 text-indigo-600" />
                <h2 className="text-lg font-bold text-[#0F172A]">
                  Upload Your Resume
                </h2>
              </div>

              <form onSubmit={handleUploadResume} className="space-y-4">
                <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 transition rounded-2xl p-6 text-center bg-slate-50/50 cursor-pointer relative">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <FileText className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-700">
                    {file ? file.name : "Click or drop PDF/DOCX resume here"}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Max file size 10MB
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={uploading || !file}
                  className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold py-3 px-4 rounded-xl transition shadow-sm text-sm disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <Bot className="h-4 w-4" />
                  <span>
                    {uploading
                      ? "Processing Resume..."
                      : "Upload & Parse Resume"}
                  </span>
                </button>
              </form>

              {myResume && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-xs font-bold text-slate-700 mb-2">
                    Active Resume on File:
                  </p>
                  <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 text-xs space-y-1">
                    <p className="font-semibold text-indigo-900 truncate">
                      {myResume.fileName}
                    </p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {myResume.extractedSkills?.map((skill, idx) => (
                        <span
                          key={idx}
                          className="bg-white text-indigo-700 px-2 py-0.5 rounded-md text-[10px] font-medium border border-indigo-200"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* AVAILABLE OPENINGS & INTERVIEWS */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center space-x-2">
                <Briefcase className="h-5 w-5 text-indigo-600" />
                <h2 className="text-lg font-bold text-[#0F172A]">
                  Available Role Assessments
                </h2>
              </div>

              {loadingJobs ? (
                <p className="text-xs text-slate-400 p-4">
                  Loading open roles...
                </p>
              ) : jobs.length === 0 ? (
                <p className="text-xs text-slate-400 p-4">
                  No job openings published yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {jobs.map((job) => (
                    <div
                      key={job._id}
                      className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 flex items-center justify-between hover:border-indigo-200 transition"
                    >
                      <div className="space-y-1 min-w-0 pr-4">
                        <h3 className="font-bold text-sm text-slate-900 truncate">
                          {job.title}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {job.company || "TechCorp Solutions"}
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          navigate(`/interview/${job._id}/demo-resume`)
                        }
                        className="bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-sm shrink-0 flex items-center space-x-1.5"
                      >
                        <span>Start AI Assessment</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
