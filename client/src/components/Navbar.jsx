import React from "react";
import { Link } from "react-router-dom";
import { Bot, UserCheck, Briefcase } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="bg-slate-900 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Bot className="h-8 w-8 text-indigo-400" />
            <span className="font-bold text-xl tracking-tight">
              TalentFlow AI
            </span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link
              to="/candidate"
              className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-800 transition"
            >
              <UserCheck className="h-4 w-4 text-emerald-400" />
              <span>Candidate Portal</span>
            </Link>
            <Link
              to="/recruiter"
              className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-800 transition"
            >
              <Briefcase className="h-4 w-4 text-indigo-400" />
              <span>Recruiter Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
