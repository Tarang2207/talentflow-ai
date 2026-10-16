// client/src/components/Navbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
      {/* Brand logo & icon */}
      <Link to="/" className="flex items-center space-x-2">
        <div className="h-8 w-8 rounded-lg bg-[#4F46E5] flex items-center justify-center text-white font-black text-lg">
          🤖
        </div>
        <span className="text-[#0F172A] font-bold text-xl tracking-tight">
          TalentFlow AI
        </span>
      </Link>

      {/* Action buttons */}
      <div className="flex items-center space-x-4">
        {user ? (
          <>
            <Link
              to={user.role === "Recruiter" ? "/recruiter" : "/candidate"}
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition"
            >
              {user.role === "Recruiter"
                ? "Recruiter Dashboard"
                : "Candidate Portal"}
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-1.5 text-sm font-semibold text-rose-600 border border-rose-100 bg-rose-50 hover:bg-rose-100 hover:text-rose-700 px-3 py-1.5 rounded-lg transition"
            >
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="text-sm font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 transition"
            >
              Sign in
            </Link>

            <Link
              to="/login"
              className="bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm font-semibold px-4 py-2 rounded-lg transition shadow-sm"
            >
              Get started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
