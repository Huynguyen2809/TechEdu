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
      className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm p-5 text-left w-full
        ${onClick ? "hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md hover:-translate-y-1 cursor-pointer" : "cursor-default"}
        transition-all group relative overflow-hidden`}
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/0 to-slate-100/50 dark:to-slate-800/50 rounded-bl-full -z-10 pointer-events-none"></div>
      <div className="flex items-start justify-between">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        {onClick && (
          <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/40 transition-colors">
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
          </div>
        )}
      </div>
      <div className="mt-4 relative z-10">
        <p className="text-3xl font-black text-slate-900 dark:text-slate-100 tabular-nums leading-none">
          {value ?? <span className="inline-block w-12 h-8 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1.5 uppercase tracking-wider">{label}</p>
        {trend && <p className="text-[11px] text-emerald-500 font-bold mt-1 bg-emerald-50 dark:bg-emerald-950/50 inline-block px-1.5 py-0.5 rounded">{trend}</p>}
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
      className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm p-5 md:p-6 text-left w-full
        hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group flex items-center gap-4 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/0 to-slate-100/30 dark:to-slate-800/30 rounded-bl-full -z-10 pointer-events-none group-hover:scale-110 transition-transform"></div>
      
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform ${color}`}>
        <Icon className="w-7 h-7" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-extrabold text-base text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{label}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed font-medium">{desc}</p>
      </div>
      <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/60 flex items-center justify-center shrink-0 transition-colors">
        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
      </div>
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
    <div className="space-y-8 font-sans animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* WELCOME BANNER (Glassmorphism + Gradient) */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 rounded-3xl p-8 md:p-10 shadow-xl overflow-hidden border border-indigo-500/30">
        {/* Decorative Blurs */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-10 -bottom-20 w-48 h-48 bg-purple-500/20 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight drop-shadow-sm">
                Tổng quan Hệ thống
              </h1>
            </div>
            <p className="text-indigo-100 text-sm md:text-base font-medium max-w-2xl leading-relaxed">
              Theo dõi nhân sự, phân công tổ chuyên môn và quản lý lưu trữ kho tài liệu dùng chung trên toàn hệ thống Trung tâm.
            </p>
          </div>
          <div className="hidden md:flex flex-col items-end gap-1">
            <span className="text-xs font-bold text-indigo-200 uppercase tracking-widest bg-black/20 px-3 py-1 rounded-full border border-white/10 backdrop-blur-sm">Phân hệ Quản trị</span>
            <span className="text-[10px] text-indigo-300 font-medium">Bảo mật &amp; Quản lý tập trung</span>
          </div>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="space-y-4">
        <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
          <div className="w-1 h-4 bg-indigo-600 rounded-full"></div>
          Thống kê tổng quát
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-5">
          <StatCard
            icon={Users}
            label="Tổng nhân sự"
            value={stats?.totalStaff}
            color="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
            onClick={() => navigate("/center-manager/users")}
          />
          <StatCard
            icon={Award}
            label="Giáo viên"
            value={stats?.totalTeachers}
            color="bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/40"
            onClick={() => navigate("/center-manager/users")}
          />
          <StatCard
            icon={GraduationCap}
            label="Học sinh"
            value={stats?.totalStudents}
            color="bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40"
          />
          <StatCard
            icon={Building2}
            label="Tổ chuyên môn"
            value={stats?.totalDepartments}
            color="bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800/40"
            onClick={() => navigate("/center-manager/departments")}
          />
          <StatCard
            icon={FolderLock}
            label="Tài liệu chung"
            value={stats?.totalSharedDocuments}
            color="bg-rose-50 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/40"
            onClick={() => navigate("/center-manager/documents")}
          />
        </div>
      </div>

      {/* QUICK LINKS */}
      <div className="space-y-4">
        <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
          <div className="w-1 h-4 bg-indigo-600 rounded-full"></div>
          Chức năng Quản trị nhanh
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <QuickLink
            icon={Users}
            label="Quản lý Nhân sự"
            desc="Cấp phát tài khoản, phân quyền & khóa/mở khóa nhân viên trên toàn hệ thống"
            path="/center-manager/users"
            color="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-blue-500/30"
          />
          <QuickLink
            icon={Building2}
            label="Tổ chuyên môn"
            desc="Tạo lập danh sách Tổ bộ môn & chỉ định Tổ trưởng chuyên môn"
            path="/center-manager/departments"
            color="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-purple-500/30"
          />
          <QuickLink
            icon={FolderLock}
            label="Kho Tài liệu chung"
            desc="Tải lên và phân phối các biểu mẫu, quy chế chung cho toàn bộ giáo viên"
            path="/center-manager/documents"
            color="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-indigo-500/30"
          />
        </div>
      </div>
    </div>
  );
}
