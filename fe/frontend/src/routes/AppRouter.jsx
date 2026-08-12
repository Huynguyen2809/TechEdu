import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

// ─── Auth ───────────────────────────────────────────────────────────
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForceChangePassword from "../pages/auth/ForceChangePassword";

import TeacherLayout from "../components/teacher/TeacherLayout";
import StudentLayout from "../components/layout/StudentLayout";
import AdminLayout from "../components/layout/AdminLayout";

// ─── Teacher ─────────────────────────────────────────────────────────
import TeacherDashboard from "../pages/teacher/TeacherDashboard";
import ClassManagement from "../pages/teacher/ClassManagement";
import ClassDetail from "../pages/teacher/ClassDetail";
import Repository from "../pages/teacher/Repository";
import CreateExam from "../pages/teacher/CreateExam";
import Gradebook from "../pages/teacher/Gradebook";

// ─── Student ─────────────────────────────────────────────────────────
import StudentDashboard from "../pages/student/StudentDashboard";
import MyClasses from "../pages/student/MyClasses";
import StudentClassDetail from "../pages/student/StudentClassDetail";
import UpcomingExams from "../pages/student/UpcomingExams";
import TakeExam from "../pages/student/TakeExam";
import ExamHistory from "../pages/student/ExamHistory";

// ─── Center Manager & Department Head ──────────────────────────────────
import CenterManagerDashboard from "../pages/center-manager/CenterManagerDashboard";
import UserManagement from "../pages/center-manager/UserManagement";
import DepartmentManagement from "../pages/center-manager/DepartmentManagement";
import DocumentManagement from "../pages/center-manager/DocumentManagement";

export default function AppRouter() {
  return (
    <Routes>
      {/* Redirect gốc về login */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route 
        path="/force-change-password" 
        element={
          <ProtectedRoute>
            <ForceChangePassword />
          </ProtectedRoute>
        } 
      />

      {/* ======= LUỒNG GIÁO VIÊN ======= */}
      <Route
        path="/teacher/*"
        element={
          <ProtectedRoute allowedRoles={["TEACHER", "CENTER_MANAGER", "DEPARTMENT_HEAD"]}>
            <TeacherLayout>
              <Routes>
                <Route path="dashboard"    element={<TeacherDashboard />} />
                <Route path="classes"      element={<ClassManagement />} />
                <Route path="classes/:id"  element={<ClassDetail />} />
                <Route path="repository"   element={<Repository />} />
                <Route path="exams"        element={<CreateExam />} />
                <Route path="gradebook"    element={<Gradebook />} />
                {/* Fallback */}
                <Route path="*" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </TeacherLayout>
          </ProtectedRoute>
        }
      />

      {/* ======= LUỒNG HỌC SINH ======= */}
      <Route
        path="/student/*"
        element={
          <ProtectedRoute allowedRoles={["STUDENT"]}>
            <StudentLayout>
              <Routes>
                <Route path="dashboard"      element={<StudentDashboard />} />
                <Route path="classes"        element={<MyClasses />} />
                <Route path="classes/:classId" element={<StudentClassDetail />} />
                <Route path="my-classes"     element={<MyClasses />} />
                <Route path="upcoming-exams" element={<UpcomingExams />} />
                <Route path="exam/:id"       element={<TakeExam />} />
                <Route path="history"        element={<ExamHistory />} />
                {/* Fallback */}
                <Route path="*" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </StudentLayout>
          </ProtectedRoute>
        }
      />

      {/* ======= LUỒNG QUẢN TRỊ (CENTER MANAGER / DEPARTMENT HEAD) ======= */}
      <Route
        path="/center-manager/*"
        element={
          <ProtectedRoute allowedRoles={["CENTER_MANAGER", "DEPARTMENT_HEAD"]}>
            <AdminLayout>
              <Routes>
                <Route path="dashboard"   element={<CenterManagerDashboard />} />
                <Route path="users"       element={<UserManagement />} />
                <Route path="departments" element={<DepartmentManagement />} />
                <Route path="documents"   element={<DocumentManagement />} />
                {/* Fallback */}
                <Route path="*" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* Catch-all: mọi route không khớp -> login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
