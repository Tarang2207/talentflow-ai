// client/src/pages/CandidatePortal.jsx
import React, { useState } from "react";
import {
  UploadCloud,
  FileText,
  CheckCircle,
  Sparkles,
  AlertCircle,
} from "lucide-react";

export default function CandidatePortal() {
  const [selectedJob, setSelectedJob] = useState("1");
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [matchResult, setMatchResult] = useState(null);

  // Mock list of jobs (will connect to backend database)
  const availableJobs = [
    {
      id: "1",
      title: "Full Stack MERN Developer",
      company: "TechCorp Solutions",
    },
    { id: "2", title: "Frontend Engineer (React)", company: "Innovate AI" },
  ];

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
      } else {
        alert("Please upload a PDF document.");
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile);
      } else {
        alert("Please upload a PDF document.");
      }
    }
  };

  const handleSimulateUpload = () => {
    if (!file) return;
    setUploading(true);

    // Simulate AI parsing delay
    setTimeout(() => {
      setUploading(false);
      setMatchResult({
        score: 88,
        summary:
          "Strong match on React, Node.js, and MongoDB experience. Minor gap in Docker containerization.",
      });
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Candidate Screening Portal
        </h1>
        <p className="text-slate-600 mt-2">
          Upload your resume PDF to instantly evaluate your semantic match score
          against open positions.
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-6">
        {/* Job Selection Dropdown */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Select Target Opening
          </label>
          <select
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            {availableJobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title} — {j.company}
              </option>
            ))}
          </select>
        </div>

        {/* Drag-and-Drop Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition cursor-pointer ${
            isDragging
              ? "border-indigo-500 bg-indigo-50"
              : "border-slate-300 hover:border-slate-400 bg-slate-50"
          }`}
        >
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            id="file-upload"
            className="hidden"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center space-y-3"
          >
            <UploadCloud className="h-12 w-12 text-indigo-500" />
            <div>
              <p className="text-base font-semibold text-slate-800">
                {file
                  ? file.name
                  : "Click to upload or drag & drop your PDF resume"}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                PDF files only (Max 5MB)
              </p>
            </div>
          </label>
        </div>

        {file && (
          <div className="flex items-center justify-between bg-indigo-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <FileText className="h-6 w-6 text-indigo-600" />
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {file.name}
                </p>
                <p className="text-xs text-slate-500">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <button
              onClick={handleSimulateUpload}
              disabled={uploading}
              className="bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center space-x-2 disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              <span>
                {uploading ? "Parsing & Matching..." : "Run Match Analysis"}
              </span>
            </button>
          </div>
        )}

        {/* Semantic Match Result Card */}
        {matchResult && (
          <div className="bg-slate-900 text-white p-6 rounded-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-6 w-6 text-emerald-400" />
                <h3 className="text-lg font-bold">
                  Semantic Vector Analysis Complete
                </h3>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black text-emerald-400">
                  {matchResult.score}%
                </span>
                <p className="text-xs text-slate-400">Match Score</p>
              </div>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed">
              {matchResult.summary}
            </p>

            <button className="w-full bg-emerald-500 text-slate-950 font-bold py-2.5 px-4 rounded-lg hover:bg-emerald-400 transition flex items-center justify-center space-x-2">
              <Sparkles className="h-4 w-4" />
              <span>Start AI Technical Screening Interview</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
