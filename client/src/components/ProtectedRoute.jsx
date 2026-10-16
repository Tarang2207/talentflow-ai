// client/src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuthStore();

  // 1. Not logged in -> Redirect to Login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Role not authorized -> Redirect to their proper portal
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <Navigate
        to={user.role === "Recruiter" ? "/recruiter" : "/candidate"}
        replace
      />
    );
  }

  return children;
}
