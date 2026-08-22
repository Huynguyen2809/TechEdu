import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import authService from "../../services/authService";
import {
  Phone,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  GraduationCap,
  Sparkles,
  UserPlus,
  Sun,
  Moon
} from "lucide-react";

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

export default function Register() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Regex kiểm tra SĐT Việt Nam hợp lệ
  const validatePhone = (phone) => {
    const phoneRegex = /^0[35789]\d{8}$/;
    return phoneRegex.test(phone);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    // Validate đầu vào
    if (!fullName.trim() || !phoneNumber.trim() || !password.trim()) {
      setError("Vui lòng nhập đầy đủ Họ tên, Số điện thoại và Mật khẩu.");
      return;
    }
    if (!validatePhone(phoneNumber)) {
      setError("Số điện thoại không hợp lệ!");
      return;
    }
    if (password.length < 6) {
      setError("Mật khẩu cần có độ dài tối thiểu 6 ký tự.");
      return;
    }

    setLoading(true);
    try {
      await authService.register({
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        password: password,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error("Lỗi đăng ký:", err);
      if (err.response && err.response.status === 409) {
        setError("Số điện thoại này đã được đăng ký trên hệ thống.");
      } else {
        setError(
          err.response?.data?.message ||
            "Đăng ký thất bại. Vui lòng kiểm tra lại kết nối.",
        );
      }
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
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-violet-500/15 dark:bg-violet-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/15 dark:bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse-glow" style={{ animationDelay: '1.5s' }} />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e130_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e130_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Main Container Card */}
      <div className="max-w-[460px] w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-3xl shadow-xl dark:shadow-2xl border border-slate-200/80 dark:border-slate-800 p-8 sm:p-10 relative z-10 transition-all">
        {/* Card Header (Không có logo bên trong khung) */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Đăng ký học sinh mới
          </h1>
        </div>

        {/* Success Alert State */}
        {success ? (
          <div className="py-8 text-center space-y-4 animate-fade-in">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl border border-emerald-500/30 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 dark:text-emerald-400 animate-bounce" />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              Tạo tài khoản thành công!
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto font-medium">
              Hệ thống đang chuyển hướng bạn về trang Đăng nhập...
            </p>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Error Alert */}
            {error && (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/80 rounded-2xl flex items-start gap-3 text-rose-700 dark:text-rose-300 text-xs sm:text-sm animate-fade-in shadow-xs">
                <AlertCircle className="w-5 h-5 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
                <span className="font-semibold leading-relaxed">{error}</span>
              </div>
            )}

            {/* Full Name Input */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Họ và tên
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nhập họ và tên học sinh"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/20 transition-all font-semibold shadow-xs"
                />
              </div>
            </div>

            {/* Phone Input */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Số điện thoại
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    if (val.length <= 10) {
                      setPhoneNumber(val);
                    }
                  }}
                  placeholder="Nhập 10 số điện thoại"
                  maxLength={10}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/20 transition-all font-semibold shadow-xs"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  className="w-full pl-10 pr-11 py-3 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/20 transition-all font-semibold shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none cursor-pointer transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Terms Disclaimer */}
            <div className="pt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              Bằng cách bấm nút "Đăng ký", tôi đồng ý với{" "}
              <a
                href="#terms"
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
              >
                Điều Khoản Sử Dụng
              </a>{" "}
              và{" "}
              <a
                href="#privacy"
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
              >
                Chính Sách Bảo Mật
              </a>{" "}
              của hệ thống.
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black py-3.5 px-5 rounded-xl shadow-lg shadow-indigo-600/25 transition-all duration-150 active:scale-[0.98] text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer border border-indigo-500/30"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Đang khởi tạo...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 stroke-[2.5]" />
                    <span>Hoàn tất Đăng ký</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Footer Link */}
        <div className="mt-8 pt-6 border-t border-slate-200/80 dark:border-slate-800/80 text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
          Bạn đã có tài khoản?{" "}
          <Link
            to="/login"
            className="font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 hover:underline ml-1"
          >
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
}

