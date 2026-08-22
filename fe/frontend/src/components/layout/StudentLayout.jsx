import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import authService from "../../services/authService";
import classService from "../../services/classService";
import submissionService from "../../services/submissionService";
import { useAuth } from "../../context/AuthContext";
import StudentSidebar from "./StudentSidebar";
import {
  Menu,
  Bell,
  Check,
  Clock,
  FileText,
  AlertCircle,
  X,
  Star,
  CheckCircle2,
  Calendar
} from "lucide-react";

export default function StudentLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();

  const [user, setUser] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    document.title = "TechEdu - Phân Hệ Học Sinh";
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

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (e) {}
    try {
      if (auth && auth.logout) {
        await auth.logout();
        return;
      }
    } catch (e) {}
    localStorage.removeItem("user");
    navigate("/login");
  };

  const currentUser = user || auth?.user;
  const studentName = currentUser?.fullName || currentUser?.name || "Học sinh";
  const studentInitials = studentName.charAt(0).toUpperCase();

  // Tải dữ liệu thông báo thực tế từ Backend Database
  useEffect(() => {
    if (!currentUser?.id && !user?.id) return;
    const userId = currentUser?.id || user?.id;

    const fetchRealNotifications = async () => {
      try {
        const [myClasses, history] = await Promise.all([
          classService.getMyClasses().catch(() => []),
          submissionService.getMyHistory().catch(() => []),
        ]);

        const classes = Array.isArray(myClasses) ? myClasses : [];
        const submissions = Array.isArray(history) ? history : [];

        let allExams = [];
        for (const cls of classes) {
          try {
            const exams = await classService.getExamsForClass(cls.id);
            if (Array.isArray(exams)) {
              allExams.push(...exams.map((e) => ({ ...e, className: cls.name })));
            }
          } catch (e) {}
        }

        const now = new Date();
        const readIds = JSON.parse(localStorage.getItem(`read_notifs_${userId}`) || "[]");
        const realNotifs = [];

        // 1. Thông báo bài thi đang mở làm bài
        allExams.forEach((exam) => {
          const start = new Date(exam.startTime);
          const end = new Date(exam.endTime);
          if (!exam.hasSubmitted && now >= start && now <= end) {
            const notifId = `exam_${exam.id}`;
            realNotifs.push({
              id: notifId,
              title: "Bài thi đang mở làm bài",
              desc: `Bài thi "${exam.title}" (Lớp ${exam.className}) đang mở làm bài.`,
              time: `Hạn nộp: ${end.toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}`,
              unread: !readIds.includes(notifId),
              type: "exam",
              link: "/student/dashboard",
            });
          }
        });

        // 2. Thông báo bài thi sắp hết hạn (trong vòng 24h)
        allExams.forEach((exam) => {
          const end = new Date(exam.endTime);
          const diffHours = (end - now) / (1000 * 60 * 60);
          if (!exam.hasSubmitted && diffHours > 0 && diffHours <= 24) {
            const notifId = `warn_${exam.id}`;
            realNotifs.push({
              id: notifId,
              title: "Bài thi sắp hết hạn",
              desc: `Bài thi "${exam.title}" sẽ hết hạn trong ${Math.ceil(diffHours)} giờ tới.`,
              time: `Hạn nộp: ${end.toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}`,
              unread: !readIds.includes(notifId),
              type: "warning",
              link: "/student/dashboard",
            });
          }
        });

        // 3. Thông báo kết quả nộp bài vừa hoàn thành gần đây
        submissions.slice(0, 4).forEach((sub) => {
          const notifId = `sub_${sub.submissionId}`;
          realNotifs.push({
            id: notifId,
            title: "Kết quả làm bài",
            desc: `Bạn đạt ${sub.totalScore}/10 điểm trong bài thi "${sub.examTitle}".`,
            time: new Date(sub.submittedAt).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }),
            unread: !readIds.includes(notifId),
            type: "result",
            link: `/student/history?submissionId=${sub.submissionId}`,
          });
        });

        setNotifications(realNotifs);
      } catch (err) {
        console.error("Lỗi tải thông báo thực tế:", err);
      }
    };

    fetchRealNotifications();
  }, [currentUser?.id, user?.id]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllRead = () => {
    const userId = currentUser?.id || user?.id;
    const allIds = notifications.map((n) => n.id);
    if (userId) {
      localStorage.setItem(`read_notifs_${userId}`, JSON.stringify(allIds));
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleNotificationClick = (n) => {
    const userId = currentUser?.id || user?.id;
    if (userId) {
      const readIds = JSON.parse(localStorage.getItem(`read_notifs_${userId}`) || "[]");
      if (!readIds.includes(n.id)) {
        readIds.push(n.id);
        localStorage.setItem(`read_notifs_${userId}`, JSON.stringify(readIds));
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

  // Khi đang ở trong phòng thi (TakeExam), ẩn Sidebar và Topbar để tập trung tối đa
  if (location.pathname.includes("/exam/")) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-200">
        <div key={location.pathname} className="page-transition">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex text-slate-800 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* MOBILE OVERLAY */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* LEFT SIDEBAR */}
      <StudentSidebar
        user={currentUser}
        mobileSidebarOpen={mobileSidebarOpen}
        setMobileSidebarOpen={setMobileSidebarOpen}
        handleLogout={handleLogout}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      {/* RIGHT MAIN CONTENT AREA */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-200">
        {/* TOPBAR */}
        <header className="h-16 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-white/20 dark:border-slate-700/30 shadow-[0_2px_10px_rgb(0,0,0,0.02)] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 transition-all duration-200">
          {/* Left Title / Mobile Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/30 cursor-pointer transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100 tracking-tight hidden sm:inline-flex items-center gap-2">
              <span>Hệ Thống Trắc Nghiệm & Đánh Giá Năng Lực TechEdu</span>
            </span>
          </div>

          {/* Right Action Widgets */}
          <div className="flex items-center gap-3">
            {/* Notification Bell Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/30 transition-all cursor-pointer"
                title="Thông báo"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-sm">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown (Glassmorphism) */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-200/60 dark:border-slate-700/60 overflow-hidden z-50 animate-fade-in origin-top-right">
                  <div className="p-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <Bell className="w-4 h-4" />
                      <span>Thông báo của bạn</span>
                      {unreadCount > 0 && (
                        <span className="bg-white/20 text-white text-[11px] px-2 py-0.5 rounded-full font-semibold shadow-sm">
                          {unreadCount} mới
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-xs text-sky-100 hover:text-white underline cursor-pointer font-medium transition-colors"
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
                          <p className="text-[11px] text-slate-400 mt-0.5">Các thông báo về bài thi và kết quả sẽ xuất hiện tại đây.</p>
                        </div>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          className={`p-4 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${
                            n.unread ? "bg-sky-50/40 dark:bg-sky-900/20" : ""
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
                            {n.type === "warning" && (
                              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800/60 flex items-center justify-center">
                                <AlertCircle className="w-4 h-4" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className={`text-xs font-bold truncate ${n.unread ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"}`}>
                                {n.title}
                              </p>
                              {n.unread && (
                                <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                              {n.desc}
                            </p>
                            <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                              <Clock className="w-3 h-3" />
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
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 hidden md:inline-block max-w-[120px] truncate group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                {studentName}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800/60 transition-colors">
                <Star className="w-2.5 h-2.5 fill-current" />
                <span className="hidden lg:inline">Học sinh</span>
              </span>
            </div>
          </div>
        </header>

        {/* MAIN CANVAS AREA */}
        <main className="bg-[#F8FAFC] dark:bg-slate-950 min-h-screen flex-1 p-6 md:p-8 overflow-y-auto max-w-[1600px] w-full mx-auto transition-colors duration-200">
          <div key={location.pathname} className="page-transition">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
