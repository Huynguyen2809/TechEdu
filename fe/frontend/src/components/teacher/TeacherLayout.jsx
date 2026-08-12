import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import authService from "../../services/authService";
import classService from "../../services/classService";
import ThemeToggle from "../common/ThemeToggle";
import { ToastProvider } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Users,
  FolderTree,
  Award,
  LogOut,
  BrainCircuit,
  Star,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Bell,
  CheckCircle2,
  FileText,
  AlertCircle
} from "lucide-react";

export default function TeacherLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, logout } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    document.title = "TechEdu - Phân Hệ Giáo Viên";
  }, []);

  // Click outside to close notification dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const teacherName = user?.fullName || user?.name || "Giáo viên";
  const teacherInitials = teacherName.charAt(0).toUpperCase();

  // Tải dữ liệu thông báo thực tế cho Giáo viên
  useEffect(() => {
    if (!user?.id) return;
    const fetchTeacherNotifications = async () => {
      try {
        const classesData = await classService.getMyClasses().catch(() => []);
        const classes = Array.isArray(classesData) ? classesData : [];
        const readIds = JSON.parse(localStorage.getItem(`read_notifs_teacher_${user.id}`) || "[]");
        const realNotifs = [];

        // Thông báo về các lớp học đang giảng dạy
        classes.forEach((cls) => {
          const notifId = `cls_${cls.id}`;
          realNotifs.push({
            id: notifId,
            title: "Lớp học đang quản lý",
            desc: `Lớp "${cls.name}" (${cls.subjectName || "Hóa học"}) đang hoạt động.`,
            time: `Khối ${cls.gradeLevel || "12"}`,
            unread: !readIds.includes(notifId),
            type: "exam",
            link: `/teacher/classes/${cls.id}`,
          });
        });

        // Thông báo nhắc nhở kiểm tra sổ điểm & ngân hàng đề
        realNotifs.push({
          id: `notif_gradebook`,
          title: "Sổ điểm tổng hợp",
          desc: "Kiểm tra và xuất báo cáo kết quả thi của học sinh các lớp.",
          time: "Hôm nay",
          unread: !readIds.includes("notif_gradebook"),
          type: "result",
          link: "/teacher/gradebook",
        });

        setNotifications(realNotifs);
      } catch (err) {
        console.error("Lỗi tải thông báo giáo viên:", err);
      }
    };

    fetchTeacherNotifications();
  }, [user?.id]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllRead = () => {
    if (user?.id) {
      const allIds = notifications.map((n) => n.id);
      localStorage.setItem(`read_notifs_teacher_${user.id}`, JSON.stringify(allIds));
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleNotificationClick = (n) => {
    if (user?.id) {
      const readIds = JSON.parse(localStorage.getItem(`read_notifs_teacher_${user.id}`) || "[]");
      if (!readIds.includes(n.id)) {
        readIds.push(n.id);
        localStorage.setItem(`read_notifs_teacher_${user.id}`, JSON.stringify(readIds));
      }
    }
    setNotifications((prev) =>
      prev.map((item) => (item.id === n.id ? { ...item, unread: false } : item))
    );
    setShowNotifications(false);
    if (n.link) {
      navigate(n.link);
    }
  };

  const handleLogout = async () => {
    if (logout) {
      await logout();
    } else {
      try {
        await authService.logout();
      } catch (e) {}
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  const navItems = [
    {
      label: "Bảng điều khiển",
      path: "/teacher/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Tạo bài thi",
      path: "/teacher/exams",
      icon: FileText,
    },
    {
      label: "Lớp học",
      path: "/teacher/classes",
      icon: Users,
    },
    {
      label: "Ngân hàng đề",
      path: "/teacher/repository",
      icon: FolderTree,
    },
    {
      label: "Sổ điểm",
      path: "/teacher/gradebook",
      icon: Award,
    },
  ];

  const isPathActive = (path) => {
    if (path === "/teacher/dashboard") {
      return location.pathname === "/teacher/dashboard" || location.pathname === "/teacher";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex text-slate-800 dark:text-slate-100 font-sans transition-colors duration-200">
        {/* MOBILE OVERLAY */}
        {mobileSidebarOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* LEFT SIDEBAR */}
        <aside
          className={`fixed lg:sticky top-0 left-0 h-screen bg-white dark:bg-slate-900 border-r border-slate-200/60 dark:border-slate-800/60 flex flex-col justify-between z-50 transition-[width,transform] duration-300 ease-in-out p-3 overflow-hidden shadow-sm ${
            mobileSidebarOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"
          } ${isCollapsed ? "lg:w-20" : "lg:w-64"} shrink-0`}
        >
          <div>
            {/* Logo & Brand Header */}
            <div className={`flex items-center ${isCollapsed ? "justify-center flex-col gap-2" : "justify-between"} pb-4 border-b border-slate-200/60 dark:border-slate-800/60 min-h-[56px]`}>
              <Link to="/teacher/dashboard" className="flex items-center gap-3 group shrink-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-500 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform shrink-0">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                {!isCollapsed && (
                  <div className="transition-opacity duration-200">
                    <span className="font-extrabold text-lg text-slate-900 dark:text-slate-100 tracking-tight block leading-tight truncate">
                      TechEdu
                    </span>
                  </div>
                )}
              </Link>
              
              {/* Desktop Collapse Toggle */}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors cursor-pointer shrink-0"
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

            {/* Navigation Items */}
            <nav className="mt-5 space-y-2">
              {!isCollapsed && (
                <p className="px-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  Quản Lý Giảng Dạy
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
                        ? `w-12 h-12 rounded-xl flex items-center justify-center mx-auto transition-all ${
                            active
                              ? "bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 shadow-sm border border-indigo-100 dark:border-indigo-500/30"
                              : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100"
                          }`
                        : `flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                            active
                              ? "bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 shadow-sm border border-indigo-100 dark:border-indigo-500/30"
                              : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100"
                          }`
                    }
                  >
                    <Icon className={`w-5 h-5 shrink-0 ${active ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500"}`} />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="space-y-3">
            <ThemeToggle compact={isCollapsed} />

            {/* User Card at bottom of Sidebar */}
            <div className={`flex items-center ${isCollapsed ? "justify-center p-1.5" : "justify-between gap-2 p-3"} rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 shadow-sm`}>
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{teacherName}</p>
                  {user?.email && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                  )}
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-100/50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 mt-1">
                    <Star className="w-3 h-3 fill-current" /> GIÁO VIÊN
                  </span>
                </div>
              )}
              <button
                onClick={handleLogout}
                className={`rounded-xl transition-colors cursor-pointer text-slate-500 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 hover:text-rose-600 dark:hover:text-rose-400 ${
                  isCollapsed ? "w-10 h-10 flex items-center justify-center" : "p-2"
                }`}
                title="Đăng xuất"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </aside>

        {/* RIGHT MAIN CONTENT AREA */}
        <div className="flex-1 min-w-0 flex flex-col min-h-screen bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-200">
          {/* TOP BAR */}
          <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60 shadow-sm px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 transition-all duration-200">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors cursor-pointer"
              >
                <Menu className="w-5 h-5" />
              </button>
              <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100 tracking-tight hidden sm:inline-block">
                Hệ Thống Quản Lý &amp; Đánh Giá Giảng Dạy TechEdu
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Notification Bell Dropdown */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-xl text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all cursor-pointer"
                  title="Thông báo"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-sm">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Popover Dropdown (Glassmorphism) */}
                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-700/60 overflow-hidden z-50 animate-fade-in origin-top-right">
                    <div className="p-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-sm">
                        <Bell className="w-4 h-4" />
                        <span>Thông báo giảng dạy</span>
                        {unreadCount > 0 && (
                          <span className="bg-white/20 text-white text-[11px] px-2 py-0.5 rounded-full font-semibold">
                            {unreadCount} mới
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="text-xs text-indigo-100 hover:text-white underline cursor-pointer font-medium"
                        >
                          Đánh dấu đã đọc
                        </button>
                      )}
                    </div>

                    <div className="max-h-[320px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center space-y-3">
                          <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto border border-slate-100 dark:border-slate-700">
                            <Bell className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Không có thông báo mới</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">Các cập nhật về lớp học và bài thi sẽ xuất hiện tại đây.</p>
                          </div>
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => handleNotificationClick(n)}
                            className={`p-4 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${
                              n.unread ? "bg-indigo-50/40 dark:bg-indigo-900/20" : ""
                            }`}
                          >
                            <div className="mt-0.5 shrink-0">
                              {n.type === "exam" && (
                                <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-800/60 flex items-center justify-center">
                                  <FileText className="w-4 h-4" />
                                </div>
                              )}
                              {n.type === "result" && (
                                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/60 flex items-center justify-center">
                                  <CheckCircle2 className="w-4 h-4" />
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center justify-between gap-2">
                                <p className={`text-xs font-bold truncate ${n.unread ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"}`}>
                                  {n.title}
                                </p>
                                {n.unread && (
                                  <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                {n.desc}
                              </p>
                              <p className="text-[10px] text-slate-400 font-semibold">
                                {n.time}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Capsule Widget */}
              <div className="flex items-center gap-2.5 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-full border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-inner">
                  {teacherInitials}
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100 hidden md:inline-block max-w-[120px] truncate">
                  {teacherName}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/60">
                  <Star className="w-2.5 h-2.5 fill-current" />
                  <span className="hidden lg:inline">Giáo viên</span>
                </span>
              </div>
            </div>
          </header>

          {/* MAIN PAGE BODY */}
          <main className="bg-[#F8FAFC] dark:bg-slate-950 min-h-screen flex-1 p-6 md:p-8 max-w-[1600px] w-full mx-auto transition-colors duration-200 overflow-y-auto">
            <div key={location.pathname} className="page-transition">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
