import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  GraduationCap,
  LogOut,
  User,
  Shield,
  Users,
  BookOpen,
} from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Tạo huy hiệu vai trò và màu sắc tương ứng theo chuẩn Indigo & Slate
  const getRoleBadge = (role) => {
    switch (role) {
      case "TEACHER":
        return {
          label: "Giáo viên",
          color: "bg-indigo-50 text-indigo-700 border-indigo-200",
          icon: Users,
        };
      case "STUDENT":
        return {
          label: "Học sinh",
          color: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: GraduationCap,
        };
      case "CENTER_MANAGER":
        return {
          label: "Giám đốc trung tâm",
          color: "bg-purple-50 text-purple-700 border-purple-200",
          icon: Shield,
        };
      case "DEPARTMENT_HEAD":
        return {
          label: "Tổ trưởng bộ môn",
          color: "bg-purple-50 text-purple-700 border-purple-200",
          icon: Shield,
        };
      default:
        return {
          label: "Người dùng",
          color: "bg-slate-100 text-slate-700 border-slate-200",
          icon: User,
        };
    }
  };

  const badge = getRoleBadge(user?.role);
  const BadgeIcon = badge.icon;

  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-50 shadow-xs">
      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between">
        {/* Logo & Tên hệ thống */}
        <div
          className="flex items-center gap-3 cursor-pointer shrink-0"
          onClick={() => navigate("/")}
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200 shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="hidden sm:block">
            <span className="font-bold text-slate-900 text-lg leading-tight block truncate">
              TechEdu
            </span>
            <span className="text-[11px] text-slate-500 font-medium truncate">
              Khối THPT (Toán - Lý - Hóa)
            </span>
          </div>
        </div>

        {/* Thông tin User & Thao tác */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2.5 bg-slate-50 px-2 sm:px-3.5 py-1.5 rounded-full border border-slate-200/80">
            <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-700 font-extrabold text-xs flex items-center justify-center shrink-0 border border-indigo-100">
              {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <span className="text-sm font-bold text-slate-800 hidden md:block max-w-[120px] lg:max-w-[200px] truncate">
              {user?.fullName}
            </span>

            <span
              className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full border flex items-center gap-1 ${badge.color}`}
            >
              <BadgeIcon className="w-3 h-3 shrink-0" />
              <span className="hidden lg:inline">{badge.label}</span>
            </span>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100 cursor-pointer shrink-0"
            title="Đăng xuất"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Đăng xuất</span>
          </button>
        </div>
      </div>
    </header>
  );
}
