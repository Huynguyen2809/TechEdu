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
  Bell,
  CheckCircle2,
  FileText,
  AlertCircle
} from "lucide-react";
import TeacherSidebar from "./TeacherSidebar";

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
        <TeacherSidebar
          user={user}
          mobileSidebarOpen={mobileSidebarOpen}
          setMobileSidebarOpen={setMobileSidebarOpen}
          handleLogout={handleLogout}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />

        {/* RIGHT MAIN CONTENT AREA */}
        <div className="flex-1 min-w-0 flex flex-col min-h-screen bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-200">
          {/* TOP BAR */}
          <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60 shadow-sm px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 transition-all duration-200">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-colors cursor-pointer"
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
                  className="relative p-2 rounded-xl text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-all cursor-pointer"
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
                  <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-200/60 dark:border-slate-700/60 overflow-hidden z-50 animate-fade-in origin-top-right">
                    <div className="p-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-2 font-bold text-sm">
                        <Bell className="w-4 h-4" />
                        <span>Thông báo giảng dạy</span>
                        {unreadCount > 0 && (
                          <span className="bg-white/20 text-white text-[11px] px-2 py-0.5 rounded-full font-semibold shadow-sm">
                            {unreadCount} mới
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="text-xs text-emerald-100 hover:text-white underline cursor-pointer font-medium transition-colors"
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
                              n.unread ? "bg-teal-50/40 dark:bg-teal-900/20" : ""
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
                                  <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0" />
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
              <div className="flex items-center gap-2.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200/60 dark:border-slate-700/60 shadow-sm transition-all hover:shadow-md cursor-pointer group">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100 hidden md:inline-block max-w-[120px] truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {teacherName}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800/60 transition-colors">
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
