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
 LogOut,
 BrainCircuit,
 Star,
 Menu,
 Bell,
 CheckCircle2,
 FileText,
 KeyRound
} from "lucide-react";
import centerManagerService from "../../services/centerManagerService";
import AdminSidebar from "./AdminSidebar";
import ChangePasswordModal from "../common/ChangePasswordModal";

export default function AdminLayout({ children }) {
 const navigate = useNavigate();
 const location = useLocation();

 const { user, logout } = useAuth();
 const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
 const [isCollapsed, setIsCollapsed] = useState(false);

 const [showNotifications, setShowNotifications] = useState(false);
 const notifRef = useRef(null);
 const [notifications, setNotifications] = useState([]);

 const [showProfileMenu, setShowProfileMenu] = useState(false);
 const profileMenuRef = useRef(null);
 const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

 useEffect(() => {
   document.title = "TechEdu - Phân Hệ Quản Lý Trung Tâm";
 }, []);

 // Click outside to close notification dropdown & profile menu
 useEffect(() => {
   const handleClickOutside = (e) => {
     if (notifRef.current && !notifRef.current.contains(e.target)) {
       setShowNotifications(false);
     }
     if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
       setShowProfileMenu(false);
     }
   };
   document.addEventListener("mousedown", handleClickOutside);
   return () => document.removeEventListener("mousedown", handleClickOutside);
 }, []);

 let managerName = user?.fullName || user?.name || "Quản lý trung tâm";
 if (managerName.toLowerCase().includes("quản trị viên hệ thống") || managerName.toLowerCase().includes("quản trị") || managerName.toLowerCase().includes("giám đốc")) {
   managerName = "Quản lý trung tâm";
 }
 const managerInitials = managerName.charAt(0).toUpperCase();

 // Notifications for Center Manager từ API thực tế
 useEffect(() => {
   if (!user?.id) return;
   const fetchAdminNotifications = async () => {
     try {
       const [stats, depts] = await Promise.all([
         centerManagerService.getSystemStats().catch(() => null),
         centerManagerService.getAllDepartments().catch(() => [])
       ]);

       const readIds = JSON.parse(localStorage.getItem(`read_notifs_admin_${user.id}`) || "[]");
       const realNotifs = [];

       if (stats?.totalStaff) {
         realNotifs.push({
           id: "notif_staff_summary",
           title: "Tổng quan nhân sự",
           desc: `Hệ thống hiện có ${stats.totalStaff} nhân sự (${stats.totalTeachers || 0} giáo viên).`,
           time: "Hôm nay",
           unread: !readIds.includes("notif_staff_summary"),
           type: "user",
           link: "/center-manager/users"
         });
       }

       if (Array.isArray(depts) && depts.length > 0) {
         realNotifs.push({
           id: "notif_dept_summary",
           title: "Tổ chuyên môn hoạt động",
           desc: `Có ${depts.length} Tổ bộ môn đang hoạt động và quản lý học liệu.`,
           time: "Hôm nay",
           unread: !readIds.includes("notif_dept_summary"),
           type: "dept",
           link: "/center-manager/departments"
         });
       }

       if (stats?.totalSharedDocuments) {
         realNotifs.push({
           id: "notif_docs_summary",
           title: "Kho học liệu dùng chung",
           desc: `Đang lưu trữ ${stats.totalSharedDocuments} tài liệu quy chế và biểu mẫu chuẩn.`,
           time: "Mới nhất",
           unread: !readIds.includes("notif_docs_summary"),
           type: "file",
           link: "/center-manager/documents"
         });
       }

       setNotifications(realNotifs);
     } catch (err) {
       console.error("Lỗi tải thông báo quản trị:", err);
     }
   };

   fetchAdminNotifications();
 }, [user?.id]);

 const unreadCount = notifications.filter((n) => n.unread).length;

 const markAllRead = () => {
 setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
 localStorage.setItem(`read_notifs_admin_${user.id}`, JSON.stringify(notifications.map(n => n.id)));
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
  <div className="hidden sm:flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 dark:from-indigo-500/20 dark:via-purple-500/20 dark:to-pink-500/20 border border-indigo-200/60 dark:border-indigo-800/60 shadow-xs backdrop-blur-md">
    <KeyRound className="w-4 h-4 text-amber-500 shrink-0" />
    <span className="text-xs md:text-sm font-black bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 dark:from-indigo-400 dark:via-violet-300 dark:to-purple-400 bg-clip-text text-transparent tracking-tight">
      Học là con đường ngắn nhất dẫn đến thành công !
    </span>
  </div>
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

  {/* User Capsule Widget & Profile Dropdown */}
  <div className="relative" ref={profileMenuRef}>
    <button
      onClick={() => setShowProfileMenu(!showProfileMenu)}
      className="flex items-center gap-2.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200/60 dark:border-slate-700/60 shadow-sm transition-all hover:shadow-md cursor-pointer group"
    >
      <span className="text-xs font-bold text-slate-800 dark:text-slate-100 hidden md:inline-block max-w-[120px] truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
        {managerName}
      </span>
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-violet-50 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 border border-violet-100 dark:border-violet-800/60 transition-colors">
        <Star className="w-2.5 h-2.5 fill-current" />
        <span className="hidden lg:inline">Quản lý</span>
      </span>
    </button>

    {/* Profile Dropdown Menu */}
    {showProfileMenu && (
      <div className="absolute right-0 mt-2.5 w-56 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 p-2 z-50 animate-fade-in origin-top-right space-y-1">
        <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
          <p className="text-xs font-black text-slate-900 dark:text-white truncate">{managerName}</p>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">Quản Lý Trung Tâm</p>
        </div>

        <button
          onClick={() => {
            setShowProfileMenu(false);
            setIsPasswordModalOpen(true);
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer text-left"
        >
          <KeyRound className="w-4 h-4 text-indigo-500" />
          <span>Đổi mật khẩu</span>
        </button>

        <button
          onClick={() => {
            setShowProfileMenu(false);
            logout();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer text-left"
        >
          <LogOut className="w-4 h-4 text-rose-500" />
          <span>Đăng xuất</span>
        </button>
      </div>
    )}
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

  {/* MODAL ĐỔI MẬT KHẨU */}
  <ChangePasswordModal
    isOpen={isPasswordModalOpen}
    onClose={() => setIsPasswordModalOpen(false)}
  />
  </ToastProvider>
  );
}
