import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import centerManagerService from "../../services/centerManagerService";
import {
  Users, GraduationCap, FileText,
  TrendingUp, ChevronRight,
  Activity, Award, Building2, FolderLock
} from "lucide-react";

// ─── StatCard ──────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color, onClick, trend }) {
  return (
    <button
      onClick={onClick}
      className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-5 text-left w-full
        ${onClick ? "hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md cursor-pointer" : "cursor-default"}
        transition-all group`}
    >
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5.5 h-5.5" />
        </div>
        {onClick && (
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors mt-1" />
        )}
      </div>
      <div className="mt-3">
        <p className="text-3xl font-black text-slate-800 dark:text-slate-100 tabular-nums">
          {value ?? <span className="inline-block w-12 h-8 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />}
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">{label}</p>
        {trend && <p className="text-xs text-emerald-500 font-semibold mt-0.5">{trend}</p>}
      </div>
    </button>
  );
}

// ─── QuickLink ──────────────────────────────────────────────────────────
function QuickLink({ icon: Icon, label, desc, path, color }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(path)}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-5 text-left w-full
        hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all cursor-pointer group flex items-center gap-4"
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{label}</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">{desc}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors shrink-0" />
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN PAGE: CenterManagerDashboard
// ═══════════════════════════════════════════════════════════════════════
export default function CenterManagerDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await centerManagerService.getSystemStats();
        setStats(data);
      } catch {
        // Giữ null nếu lỗi
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-8">
      {/* WELCOME BANNER */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 rounded-2xl p-6 text-white shadow-md">
        <div className="flex items-center gap-3 mb-2">
          <Activity className="w-6 h-6 text-white/80" />
          <h1 className="text-xl font-black">Tổng quan hệ thống Quản lý Trung tâm</h1>
        </div>
        <p className="text-indigo-100 text-sm max-w-2xl">
          Theo dõi nhân sự, phân công tổ chuyên môn và quản lý lưu trữ kho tài liệu dùng chung toàn trung tâm.
        </p>
      </div>

      {/* STAT CARDS */}
      <div>
        <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
          Thống kê tổng quan
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
          <StatCard
            icon={Users}
            label="Tổng nhân sự"
            value={stats?.totalStaff}
            color="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            onClick={() => navigate("/center-manager/users")}
          />
          <StatCard
            icon={Award}
            label="Giáo viên"
            value={stats?.totalTeachers}
            color="bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400"
            onClick={() => navigate("/center-manager/users")}
          />
          <StatCard
            icon={GraduationCap}
            label="Học sinh"
            value={stats?.totalStudents}
            color="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
          />
          <StatCard
            icon={Building2}
            label="Tổ chuyên môn"
            value={stats?.totalDepartments}
            color="bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400"
            onClick={() => navigate("/center-manager/departments")}
          />
          <StatCard
            icon={FolderLock}
            label="Tài liệu chung"
            value={stats?.totalSharedDocuments}
            color="bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400"
            onClick={() => navigate("/center-manager/documents")}
          />
        </div>
      </div>

      {/* QUICK LINKS */}
      <div>
        <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
          Chức năng quản trị trung tâm
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickLink
            icon={Users}
            label="Quản lý Nhân sự"
            desc="Cấp phát tài khoản, phân quyền & khóa/mở nhân viên"
            path="/center-manager/users"
            color="bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/60"
          />
          <QuickLink
            icon={Building2}
            label="Tổ chuyên môn"
            desc="Quản lý danh sách Tổ bộ môn & chỉ định Tổ trưởng"
            path="/center-manager/departments"
            color="bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/60"
          />
          <QuickLink
            icon={FolderLock}
            label="Kho Tài liệu chung"
            desc="Tải lên và lưu trữ các biểu mẫu, quy chế chung"
            path="/center-manager/documents"
            color="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/60"
          />
        </div>
      </div>
    </div>
  );
}
