import React from "react";
import { Link, useLocation } from "react-router-dom";
import ThemeToggle from "../common/ThemeToggle";
import {
  LayoutDashboard,
  BookOpen,
  History,
  BrainCircuit,
  Star,
  LogOut,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export default function StudentSidebar({
  user,
  mobileSidebarOpen,
  setMobileSidebarOpen,
  handleLogout,
  isCollapsed = false,
  setIsCollapsed = () => { }
}) {
  const location = useLocation();

  const navItems = [
    { label: "Bảng điều khiển", path: "/student/dashboard", icon: LayoutDashboard },
    { label: "Lớp học của tôi", path: "/student/classes", icon: BookOpen },
    { label: "Lịch sử làm bài", path: "/student/history", icon: History },
  ];

  const isPathActive = (path) => {
    if (path === "/student/dashboard") {
      return location.pathname === "/student/dashboard" || location.pathname === "/student" || location.pathname === "/student/";
    }
    if (path === "/student/classes") {
      return (
        location.pathname.startsWith("/student/classes") ||
        location.pathname.startsWith("/student/my-classes") ||
        location.pathname.startsWith("/student/upcoming-exams")
      );
    }
    return location.pathname.startsWith(path);
  };

  const studentName = user?.fullName || user?.name || "Học sinh";

  return (
    <aside
      className={`fixed lg:sticky top-0 left-0 h-screen flex flex-col justify-between z-50 transition-[width,transform] duration-300 ease-in-out p-3 overflow-hidden
        bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl
        border-r border-slate-200/60 dark:border-slate-800/60 shadow-sm
        ${mobileSidebarOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"}
        ${isCollapsed ? "lg:w-20" : "lg:w-64"} shrink-0`}
    >
      <div>
        {/* Logo & Toggle Header */}
        <div className={`flex items-center ${isCollapsed ? "justify-center flex-col gap-2" : "justify-between"} pb-4 border-b border-slate-200/60 dark:border-slate-800/60 min-h-[56px]`}>
          <Link to="/student/dashboard" className="flex items-center gap-3 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-[0_4px_12px_rgb(14,165,233,0.3)] group-hover:scale-105 group-hover:shadow-[0_8px_20px_rgb(14,165,233,0.4)] transition-all duration-300 shrink-0">
              <BrainCircuit className="w-6 h-6" />
            </div>
            {!isCollapsed && (
              <div className="transition-opacity duration-200">
                <span className="font-extrabold text-lg text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-blue-600 dark:from-sky-400 dark:to-blue-400 tracking-tight block leading-tight truncate">
                  TechEdu
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/30 transition-colors cursor-pointer shrink-0"
            title={isCollapsed ? "Mở rộng menu" : "Thu gọn menu"}
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-5 space-y-1.5">
          {!isCollapsed && (
            <p className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
              Điều Hướng
            </p>
          )}
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isPathActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                title={isCollapsed ? item.label : undefined}
                onClick={() => setMobileSidebarOpen(false)}
                className={
                  isCollapsed
                    ? `w-12 h-12 rounded-xl flex items-center justify-center mx-auto transition-all duration-200 ${
                        active
                          ? "bg-sky-50 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 shadow-[inset_0_1px_3px_rgb(0,0,0,0.05)] border border-sky-100 dark:border-sky-500/30 scale-[0.98]"
                          : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100"
                      }`
                    : `flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                        active
                          ? "bg-sky-50 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 shadow-[inset_0_1px_3px_rgb(0,0,0,0.05)] border border-sky-100 dark:border-sky-500/30 scale-[0.99]"
                          : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100"
                      }`
                }
              >
                <Icon className={`w-5 h-5 shrink-0 transition-colors ${active ? "text-sky-600 dark:text-sky-400" : "text-slate-400 dark:text-slate-500 group-hover:text-sky-500 dark:group-hover:text-sky-400"}`} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="space-y-3">
        <ThemeToggle compact={isCollapsed} />

        <div className={`flex items-center ${isCollapsed ? "justify-center p-1.5" : "justify-between gap-2 p-3"} rounded-2xl
          bg-slate-50 dark:bg-slate-800/40
          border border-slate-200/60 dark:border-slate-700/60 shadow-sm transition-colors`}>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{studentName}</p>
              {user?.email && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
              )}
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold
                bg-blue-100/60 dark:bg-blue-900/40
                text-blue-700 dark:text-blue-300
                border border-blue-200/60 dark:border-blue-800/60
                mt-1.5 shadow-sm">
                <Star className="w-3 h-3 fill-current" /> HỌC SINH
              </span>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`rounded-xl transition-all duration-200 cursor-pointer
              text-slate-500 dark:text-slate-400
              hover:bg-rose-50 dark:hover:bg-rose-950/60 hover:shadow-sm
              hover:text-rose-600 dark:hover:text-rose-400 ${isCollapsed ? "w-10 h-10 flex items-center justify-center" : "p-2.5"
              }`}
            title="Đăng xuất"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
