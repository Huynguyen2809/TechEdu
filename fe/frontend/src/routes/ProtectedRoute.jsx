import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // [VÁ LỖ HỔNG BYPASS URL]
  if (user.isFirstLogin === true && location.pathname !== '/force-change-password') {
    return <Navigate to="/force-change-password" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    alert("Bạn không có quyền truy cập vào khu vực này!");
    if (user.role === "TEACHER")
      return <Navigate to="/teacher/dashboard" replace />;
    if (user.role === "STUDENT")
      return <Navigate to="/student/dashboard" replace />;
    if (user.role === "CENTER_MANAGER" || user.role === "DEPARTMENT_HEAD")
      return <Navigate to="/center-manager/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
}
