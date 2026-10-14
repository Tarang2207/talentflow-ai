// client/src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import CandidatePortal from "./pages/CandidatePortal";

function Home() {
  return (
    <div className="max-w-4xl mx-auto mt-12 p-6 text-center">
      <h1 className="text-4xl font-extrabold text-slate-900 mb-4">
        AI-Powered Candidate Screening & RAG Engine
      </h1>
      <p className="text-lg text-slate-600 mb-8">
        Transforming recruitment with automated resume vector matching and
        dynamic AI screening interviews.
      </p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/candidate" element={<CandidatePortal />} />
            <Route path="/recruiter" element={<RecruiterDashboard />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
