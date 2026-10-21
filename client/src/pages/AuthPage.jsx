// client/src/pages/AuthPage.jsx
import React, { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRight, ArrowLeft } from "lucide-react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Candidate",
  });

  const { login, register, loading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let result;

    if (isLogin) {
      result = await login(
        formData.email.trim().toLowerCase(),
        formData.password,
      );
    } else {
      result = await register({
        name: formData.name,
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role ? formData.role.toLowerCase() : "candidate",
      });
    }

    if (result && result.success) {
      // Directs user to the home page upon successful login or sign-up
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#FAFAFA]">
      {/* Left Dark Hero Section */}
      <div className="bg-[#0B0F19] p-8 lg:p-16 hidden lg:flex flex-col justify-between relative overflow-hidden">
        <Link to="/" className="flex items-center space-x-3 z-10">
          <div className="h-9 w-9 rounded-xl bg-[#4F46E5] flex items-center justify-center text-white font-black text-xl shadow-md">
            🤖
          </div>
          <span className="text-white font-bold text-xl tracking-tight">
            TalentFlow AI
          </span>
        </Link>

        <div className="max-w-md z-10 my-auto">
          <h1 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15] mb-6">
            Your next hire or your next role starts here.
          </h1>
          <p className="text-slate-400 text-base lg:text-lg leading-relaxed">
            Semantic resume matching and AI screening in one place.
          </p>
        </div>

        <div className="text-slate-600 font-medium text-sm z-10">
          TalentFlow AI
        </div>
      </div>

      {/* Right Auth Form Section */}
      <div className="flex flex-col items-center justify-center p-6 lg:p-12 relative">
        {/* Top-Right Back to Home Button */}
        <button
          onClick={() => navigate("/")}
          className="self-end lg:absolute lg:top-8 lg:right-8 mb-6 lg:mb-0 inline-flex items-center space-x-2 text-xs font-semibold text-slate-500 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-2 rounded-xl transition shadow-sm"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Home</span>
        </button>

        <div className="w-full max-w-md bg-white p-8 lg:p-10 rounded-3xl border border-slate-100 shadow-sm">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {isLogin ? "Welcome back" : "Create an account"}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Sign in or create an account.
            </p>
          </div>

          <div className="bg-slate-100 p-1 rounded-2xl flex mb-6">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition ${
                isLogin
                  ? "bg-white text-slate-900 shadow-sm font-semibold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition ${
                !isLogin
                  ? "bg-white text-slate-900 shadow-sm font-semibold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-xs mb-4 border border-rose-100 text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                I am a
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, role: "Candidate" })
                  }
                  className={`py-2.5 px-4 rounded-xl text-sm font-medium transition border ${
                    formData.role === "Candidate"
                      ? "bg-[#4F46E5] text-white border-[#4F46E5] shadow-sm font-semibold"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  Candidate
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, role: "Recruiter" })
                  }
                  className={`py-2.5 px-4 rounded-xl text-sm font-medium transition border ${
                    formData.role === "Recruiter"
                      ? "bg-[#4F46E5] text-white border-[#4F46E5] shadow-sm font-semibold"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  Recruiter
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Jane Doe"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                  required={!isLogin}
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@company.com"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold py-3 px-4 rounded-xl transition flex items-center justify-center space-x-2 shadow-sm text-sm disabled:opacity-50 mt-2 cursor-pointer"
            >
              <span>{loading ? "Processing..." : "Continue"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
