import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import authService from "../../services/authService";
import { Lock, Eye, EyeOff, AlertCircle, ShieldCheck, Sparkles, KeyRound, Sun, Moon } from "lucide-react";

function AuthThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      type="button"
      title={isDark ? "Chuyển sang giao diện Sáng" : "Chuyển sang giao diện Tối"}
      className="fixed top-5 right-5 sm:top-6 sm:right-6 z-50 flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/25 hover:border-indigo-500 dark:hover:border-indigo-500 text-slate-700 dark:text-slate-200 transition-all duration-200 active:scale-95 cursor-pointer group"
    >
      <div className="w-7 h-7 rounded-xl flex items-center justify-center bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xs">
        {isDark ? (
          <Moon className="w-4 h-4 text-indigo-400 group-hover:text-white transition-colors" />
        ) : (
          <Sun className="w-4 h-4 text-amber-500 group-hover:text-white transition-colors" />
        )}
      </div>
      <span className="text-xs font-black tracking-wide text-slate-700 dark:text-slate-200">
        {isDark ? "Tối" : "Sáng"}
      </span>
    </button>
  );
}

export default function ForceChangePassword() {
  const navigate = useNavigate();
  const { user, loginSuccess } = useAuth();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!password.trim() || !confirmPassword.trim()) {
      setError("Vui lòng nhập đầy đủ mật khẩu mới và xác nhận.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }

    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    setLoading(true);
    try {
      await authService.changePasswordFirstLogin(password);
      
      // Update local context
      const updatedUser = { ...user, isFirstLogin: false };
      loginSuccess(updatedUser);
      
      // Navigate to dashboard
      if (updatedUser.role === "CENTER_MANAGER" || updatedUser.role === "DEPARTMENT_HEAD") {
        navigate("/center-manager/dashboard");
      } else if (updatedUser.role === "TEACHER") {
        navigate("/teacher/dashboard");
      } else {
        navigate("/student/dashboard");
      }
    } catch (err) {
      console.error("Lỗi đổi mật khẩu:", err);
      setError(
        err.response?.data?.message ||
        "Đã có lỗi xảy ra. Vui lòng thử lại sau.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 sm:p-6 page-transition relative overflow-hidden font-sans transition-colors duration-300">
      {/* Logo & Tên TechEdu ở Góc Trái Màn Hình */}
      <div className="fixed top-5 left-5 sm:top-6 sm:left-6 z-50 flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25">
          <GraduationCap className="w-5 h-5" />
        </div>
        <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
          TechEdu
        </span>
      </div>

      {/* Nút Đổi Màu Chuẩn Role Giám Đốc */}
      <AuthThemeToggle />

      {/* Background Ambient Glow Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/15 dark:bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-500/15 dark:bg-amber-600/15 rounded-full blur-[120px] pointer-events-none animate-pulse-glow" style={{ animationDelay: '1.5s' }} />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e130_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e130_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Main Container Card */}
      <div className="max-w-[450px] w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-3xl shadow-xl dark:shadow-2xl border border-slate-200/80 dark:border-slate-800 p-8 sm:p-10 relative z-10 transition-all">
        {/* Card Header (Không có logo bên trong khung) */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Đổi mật khẩu bảo mật
          </h1>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-2 leading-relaxed max-w-xs mx-auto">
            Vì lý do an toàn tài khoản, vui lòng thay đổi mật khẩu mặc định trước khi sử dụng hệ thống.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/80 rounded-2xl flex items-start gap-3 text-rose-700 dark:text-rose-300 text-xs sm:text-sm animate-fade-in shadow-xs">
            <AlertCircle className="w-5 h-5 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
            <span className="font-semibold leading-relaxed">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Mật khẩu mới
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                className="w-full pl-10 pr-11 py-3 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/20 transition-all font-semibold shadow-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none cursor-pointer transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Xác nhận mật khẩu mới
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                className="w-full pl-10 pr-11 py-3 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/20 transition-all font-semibold shadow-xs"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none cursor-pointer transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black py-3.5 px-5 rounded-xl shadow-lg shadow-indigo-600/25 transition-all duration-150 active:scale-[0.98] text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer border border-indigo-500/30"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Đang lưu mật khẩu...</span>
                </>
              ) : (
                <span>Xác nhận đổi mật khẩu</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

