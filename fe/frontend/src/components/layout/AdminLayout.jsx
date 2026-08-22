import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import authService from "../../services/authService";
import ThemeToggle from "../common/ThemeToggle";
import { ToastProvider } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import {
 LayoutDashboard,
 Users,
 Building2,
 FolderLock,
 Tag,
 ShieldCheck,
 LogOut,
 BrainCircuit,
 Star,
 Menu,
 Bell,
 CheckCircle2,
 FileText
} from "lucide-react";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout({ children }) {
 const navigate = useNavigate();
 const location = useLocation();

 const { user, logout } = useAuth();
 const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
 const [isCollapsed, setIsCollapsed] = useState(false);

 const [showNotifications, setShowNotifications] = useState(false);
 const notifRef = useRef(null);
 const [notifications, setNotifications] = useState([]);

 useEffect(() => {
 document.title = "TechEdu - Phân Hệ Giám Đốc Trung Tâm";
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
 {
 label: "Danh mục Môn",
 path: "/center-manager/categories",
 icon: Tag,
 },
 {
 label: "Giám sát Bảo mật",
 path: "/center-manager/security",
 icon: ShieldCheck,
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
 className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
 onClick={() => setMobileSidebarOpen(false)}
 />
 )}

 {/* LEFT SIDEBAR */}
 <AdminSidebar
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
 <header className="h-16 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-white/20 dark:border-slate-700/30 shadow-[0_2px_10px_rgb(0,0,0,0.02)] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 transition-all duration-200">
 {/* Title / Mobile Toggle */}
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

 {/* Right Action Widgets */}
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

 {/* Popover Dropdown */}
 {showNotifications && (
 <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-200/60 dark:border-slate-700/60 overflow-hidden z-50 animate-fade-in origin-top-right">
 <div className="p-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white flex items-center justify-between shadow-sm">
 <div className="flex items-center gap-2 font-bold text-sm">
 <Bell className="w-4 h-4" />
 <span>Thông báo quản trị</span>
 {unreadCount > 0 && (
 <span className="bg-white/20 text-white text-[11px] px-2 py-0.5 rounded-full font-semibold shadow-sm">
 {unreadCount} mới
 </span>
 )}
 </div>
 {unreadCount > 0 && (
 <button
 onClick={markAllRead}
 className="text-xs text-indigo-100 hover:text-white underline cursor-pointer font-medium transition-colors"
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
 <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Không có thông báo mới nào</p>
 <p className="text-[11px] text-slate-400 mt-0.5">Các cập nhật hệ thống sẽ xuất hiện tại đây.</p>
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
 <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-800/60 flex items-center justify-center">
 <FileText className="w-4 h-4" />
 </div>
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
 <div className="flex items-center gap-2.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200/60 dark:border-slate-700/60 shadow-sm transition-all hover:shadow-md cursor-pointer group">
 <span className="text-xs font-bold text-slate-800 dark:text-slate-100 hidden md:inline-block max-w-[120px] truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
 {managerName}
 </span>
 <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-50 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 border border-violet-100 dark:border-violet-800/60 transition-colors">
 <Star className="w-2.5 h-2.5 fill-current" />
 <span className="hidden lg:inline">Giám đốc</span>
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
