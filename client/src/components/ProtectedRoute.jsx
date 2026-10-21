// client/src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, token } = useAuthStore();
  const activeToken = token || localStorage.getItem("token");

  // 1. If not logged in, redirect to login
  if (!activeToken) {
    return <Navigate to="/login" replace />;
  }

  // 2. Check role access using case-insensitive matching
  if (allowedRoles && user?.role) {
    const userRole = user.role.toLowerCase();
    const hasAccess = allowedRoles.some((r) => r.toLowerCase() === userRole);

    if (!hasAccess) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}
