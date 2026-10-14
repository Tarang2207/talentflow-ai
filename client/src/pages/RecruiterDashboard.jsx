// client/src/pages/RecruiterDashboard.jsx
import React, { useState } from "react";
import {
  PlusCircle,
  Briefcase,
  Sparkles,
  Building,
  Layers,
} from "lucide-react";

export default function RecruiterDashboard() {
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    description: "",
    requiredSkills: "",
  });

  const [jobs, setJobs] = useState([
    {
      id: "1",
      title: "Full Stack MERN Developer",
      company: "TechCorp Solutions",
      description:
        "Looking for a developer with Node.js, Express, React, and MongoDB experience.",
      requiredSkills: ["React", "Node.js", "MongoDB", "Express", "Tailwind"],
    },
  ]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.company || !formData.description) return;

    const newJob = {
      id: Date.now().toString(),
      title: formData.title,
      company: formData.company,
      description: formData.description,
      requiredSkills: formData.requiredSkills
        .split(",")
        .map((skill) => skill.trim()),
    };

    setJobs([newJob, ...jobs]);
    setFormData({
      title: "",
      company: "",
      description: "",
      requiredSkills: "",
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Recruiter Dashboard
          </h1>
          <p className="text-slate-600 mt-1">
            Post job descriptions and view AI candidate match pipelines.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Job Posting Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center space-x-2">
            <PlusCircle className="h-5 w-5 text-indigo-600" />
            <span>Post New Opening</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Job Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Senior Frontend Engineer"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Company
              </label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="e.g. Acme Corp"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Required Skills{" "}
                <span className="text-xs text-slate-500">
                  (comma separated)
                </span>
              </label>
              <input
                type="text"
                name="requiredSkills"
                value={formData.requiredSkills}
                onChange={handleChange}
                placeholder="e.g. React, Node.js, Vector Search"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Job Description
              </label>
              <textarea
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                placeholder="Paste the full job details..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center space-x-2"
            >
              <Sparkles className="h-4 w-4" />
              <span>Publish Job & Index Vector</span>
            </button>
          </form>
        </div>

        {/* Active Jobs List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Briefcase className="h-5 w-5 text-slate-700" />
            <span>Active Openings ({jobs.length})</span>
          </h2>

          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {job.title}
                  </h3>
                  <div className="flex items-center space-x-2 text-sm text-slate-500 mt-1">
                    <Building className="h-4 w-4" />
                    <span>{job.company}</span>
                  </div>
                </div>
                <span className="bg-indigo-50 text-indigo-700 text-xs px-3 py-1 rounded-full font-medium flex items-center space-x-1">
                  <Layers className="h-3 w-3" />
                  <span>Vector Index Active</span>
                </span>
              </div>

              <p className="text-slate-600 text-sm mt-3 line-clamp-2">
                {job.description}
              </p>

              <div className="flex flex-wrap gap-2 mt-4">
                {job.requiredSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-md font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
