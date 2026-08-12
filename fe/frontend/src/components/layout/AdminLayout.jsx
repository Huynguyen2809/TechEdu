import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import authService from "../../services/authService";
import ThemeToggle from "../common/ThemeToggle";
import { ToastProvider } from "../../context/ToastContext";
import {
  LayoutDashboard,
  Users,
  Building2,
  FolderLock,
  LogOut,
  BrainCircuit,
  Star,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Bell,
  CheckCircle2,
  FileText
} from "lucide-react";

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    document.title = "TechEdu - Phân Hệ Giám Đốc Trung Tâm";
    const loadUser = async () => {
      try {
        const u = await authService.getCurrentUser();
        setUser(u);
      } catch (err) {
        console.error("Lỗi lấy thông tin người dùng:", err);
      }
    };
    loadUser();
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

  let managerName = user?.fullName || user?.name || "Giám đốc";
  if (managerName.toLowerCase().includes("quản trị viên hệ thống") || managerName.toLowerCase().includes("quản trị")) {
    managerName = "Giám đốc";
  }
  const managerInitials = managerName.charAt(0).toUpperCase();

  // Notifications for Center Manager
  useEffect(() => {
    setNotifications([
      {
        id: "notif_staff_1",
        title: "Tài khoản nhân sự mới",
        desc: "Có 2 tài khoản giáo viên mới được cấp phát trong hệ thống.",
        time: "Hôm nay",
        unread: true,
        type: "user",
        link: "/center-manager/users"
      },
      {
        id: "notif_dept_1",
        title: "Cập nhật Tổ chuyên môn",
        desc: "Tổ Toán - Tin vừa phân công Tổ trưởng mới.",
        time: "Hôm qua",
        unread: false,
        type: "dept",
        link: "/center-manager/departments"
      }
    ]);
  }, []);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleNotificationClick = (n) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === n.id ? { ...item, unread: false } : item))
    );
    setShowNotifications(false);
    if (n.link) {
      navigate(n.link);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (e) {}
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const navItems = [
    {
      label: "Bảng điều khiển",
      path: "/center-manager/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Nhân sự",
      path: "/center-manager/users",
      icon: Users,
    },
    {
      label: "Tổ chuyên môn",
      path: "/center-manager/departments",
      icon: Building2,
    },
    {
      label: "Tài liệu chung",
      path: "/center-manager/documents",
      icon: FolderLock,
    },
  ];

  const isPathActive = (path) => {
    if (path === "/center-manager/dashboard") {
      return location.pathname === "/center-manager/dashboard" || location.pathname === "/center-manager" || location.pathname === "/center-manager/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex text-slate-800 dark:text-slate-100 font-sans transition-colors duration-200">
        {/* MOBILE OVERLAY */}
        {mobileSidebarOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* LEFT SIDEBAR */}
        <aside
          className={`fixed lg:sticky top-0 left-0 h-screen bg-white dark:bg-slate-900 cyber:bg-white border-r border-slate-200 dark:border-slate-800 cyber:border-r-2 cyber:border-slate-900 flex flex-col justify-between z-50 transition-[width,transform] duration-300 ease-in-out p-3 overflow-hidden shadow-sm dark:shadow-none cyber:shadow-[4px_0_0_0_#0f172a] ${
            mobileSidebarOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"
          } ${isCollapsed ? "lg:w-20" : "lg:w-64"} shrink-0`}
        >
          <div>
            {/* 1. KHU VỰC LOGO: Giống y hệt bên Học sinh */}
            <div className={`flex items-center ${isCollapsed ? "justify-center flex-col gap-2" : "justify-between"} pb-4 border-b border-slate-200 dark:border-slate-800 cyber:border-b-2 cyber:border-slate-900 min-h-[56px]`}>
              <Link to="/center-manager/dashboard" className="flex items-center gap-3 group shrink-0">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform shrink-0">
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
                className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
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
                <div className="h-2"></div>
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
                              ? "bg-indigo-600 dark:bg-indigo-500 text-white shadow-sm cyber:border-2 cyber:border-slate-900 cyber:shadow-[2px_2px_0_0_#0f172a]"
                              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                          }`
                        : `flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                            active
                              ? "bg-indigo-600 dark:bg-indigo-500 text-white shadow-sm cyber:border-2 cyber:border-slate-900 cyber:shadow-[3px_3px_0_0_#0f172a]"
                              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                          }`
                    }
                  >
                    <Icon className={`w-5 h-5 shrink-0 ${active ? "text-white" : "text-slate-500 dark:text-slate-400 cyber:text-slate-500"}`} />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="space-y-3">
            <ThemeToggle compact={isCollapsed} />

            {/* 3. KHU VỰC USER INFO (Sidebar dưới cùng): Thẻ user góc dưới bên trái clone y hệt bên Học sinh */}
            <div className={`flex items-center ${isCollapsed ? "justify-center p-1.5" : "justify-between gap-2 p-3"} rounded-2xl
              bg-slate-50 dark:bg-slate-800/60 cyber:bg-slate-50
              border border-slate-200 dark:border-slate-700 cyber:border-2 cyber:border-slate-900`}>
              {!isCollapsed && (
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs">
                    {managerInitials}
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate max-w-[100px]">
                    {managerName}
                  </span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold
                    bg-purple-50 dark:bg-purple-950/60 cyber:bg-purple-100
                    text-purple-700 dark:text-purple-300 cyber:text-purple-800
                    border border-purple-200 dark:border-purple-900/60 cyber:border-purple-300 shrink-0">
                    <Star className="w-2.5 h-2.5 fill-current" /> Giám đốc
                  </span>
                </div>
              )}
              <button
                onClick={handleLogout}
                className={`rounded-xl transition-colors cursor-pointer
                  text-slate-500 dark:text-slate-400
                  hover:bg-rose-50 dark:hover:bg-rose-950/60 cyber:hover:bg-rose-50
                  hover:text-rose-600 dark:hover:text-rose-400 cyber:hover:text-rose-600 ${isCollapsed ? "w-10 h-10 flex items-center justify-center" : "p-2"
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
          <header className="h-16 bg-white dark:bg-slate-900 cyber:bg-white border-b border-slate-200 dark:border-slate-800 cyber:border-b-2 cyber:border-slate-900 shadow-sm dark:shadow-none cyber:shadow-[0px_4px_0_0_#0f172a] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 transition-all duration-200">
            {/* Title / Mobile Toggle */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cyber:hover:bg-slate-100 cursor-pointer transition-colors border border-transparent hover:border-slate-200 cyber:border cyber:border-slate-900"
              >
                <Menu className="w-5 h-5" />
              </button>
              <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100 tracking-tight hidden sm:inline-flex items-center gap-2">
                <span>Hệ Thống Trắc Nghiệm &amp; Đánh Giá Năng Lực TechEdu</span>
              </span>
            </div>

            {/* Right Action Widgets */}
            <div className="flex items-center gap-3">
              {/* Notification Bell Dropdown */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cyber:bg-white cyber:border-2 cyber:border-slate-900 shadow-none cyber:shadow-[2px_2px_0_0_#0f172a] transition-all cursor-pointer"
                  title="Thông báo"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Popover Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 cyber:bg-white rounded-2xl shadow-xl dark:shadow-2xl border border-slate-200 dark:border-slate-800 cyber:border-2 cyber:border-slate-900 overflow-hidden z-50 animate-fade-in">
                    <div className="p-4 bg-indigo-600 text-white flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-sm">
                        <Bell className="w-4 h-4" />
                        <span>Thông báo quản trị</span>
                        {unreadCount > 0 && (
                          <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
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

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center space-y-2">
                          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                            <Bell className="w-5 h-5" />
                          </div>
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Không có thông báo mới nào</p>
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => handleNotificationClick(n)}
                            className={`p-3.5 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${
                              n.unread ? "bg-indigo-50/50 dark:bg-indigo-950/30" : ""
                            }`}
                          >
                            <div className="mt-0.5 shrink-0">
                              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                                <FileText className="w-4 h-4" />
                              </div>
                            </div>

                            <div className="flex-1 min-w-0 space-y-0.5">
                              <div className="flex items-center justify-between gap-1">
                                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                                  {n.title}
                                </p>
                                {n.unread && (
                                  <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                {n.desc}
                              </p>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
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

              <div className="flex items-center gap-2.5 bg-slate-100/80 dark:bg-slate-800/60 cyber:bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200/80 dark:border-slate-700/80 cyber:border-2 cyber:border-slate-900 shadow-xs">
                <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs">
                  {managerInitials}
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate max-w-[100px]">
                  {managerName}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900/60 shrink-0">
                  <Star className="w-2.5 h-2.5 fill-current" /> Giám đốc
                </span>
              </div>
            </div>
          </header>

          {/* MAIN PAGE BODY */}
          <main className="bg-[#F8FAFC] dark:bg-slate-950 min-h-screen flex-1 p-6 md:p-8 overflow-y-auto max-w-[1600px] w-full mx-auto transition-colors duration-200">
            <div key={location.pathname} className="page-transition">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
