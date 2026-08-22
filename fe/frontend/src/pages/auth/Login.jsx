import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import authService from "../../services/authService";
import { Phone, Lock, Eye, EyeOff, AlertCircle, GraduationCap, ShieldCheck, Sparkles, ArrowRight } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { loginSuccess, checkAuthStatus } = useAuth();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Regex kiểm tra SĐT Việt Nam hợp lệ (10 số, đầu 03/05/07/08/09)
  const validatePhone = (phone) => {
    const phoneRegex = /^0[35789]\d{8}$/;
    return phoneRegex.test(phone);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    // Validate đầu vào phía Client
    if (!phoneNumber.trim() || !password.trim()) {
      setError("Vui lòng nhập đầy đủ Số điện thoại và Mật khẩu.");
      return;
    }
    if (!validatePhone(phoneNumber)) {
      setError("Số điện thoại không đúng định dạng!");
      return;
    }

    setLoading(true);
    try {
      await authService.login({ phoneNumber, password });

      // Lấy thông tin user từ server và cập nhật AuthContext
      const userData = await authService.getCurrentUser();
      loginSuccess(userData);

      // Điều hướng theo trạng thái đăng nhập lần đầu
      if (userData.isFirstLogin) {
        navigate("/force-change-password");
        return;
      }

      // Điều hướng theo vai trò (RBAC) - dùng role từ server trả về, không đọc từ context
      if (userData.role === "CENTER_MANAGER") {
        navigate("/center-manager/dashboard");
      } else if (userData.role === "TEACHER" || userData.role === "DEPARTMENT_HEAD") {
        navigate("/teacher/dashboard");
      } else {
        navigate("/student/dashboard");
      }
    } catch (err) {
      console.error("Lỗi đăng nhập:", err);
      if (err.response && err.response.status === 401) {
        setError("Số điện thoại hoặc mật khẩu không chính xác.");
      } else {
        setError(
          err.response?.data?.message ||
          "Không thể kết nối đến máy chủ. Vui lòng thử lại sau.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 page-transition relative overflow-hidden font-sans">
      {/* Background Ambient Glow Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse-glow" style={{ animationDelay: '1.5s' }} />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Main Container Card */}
      <div className="max-w-[440px] w-full bg-slate-900/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-800 p-8 sm:p-10 relative z-10 transition-all">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25 mb-4 transform hover:scale-105 transition-transform">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            TechEdu Online
          </h1>
          <p className="text-xs font-semibold text-slate-400 mt-1.5 flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Hệ thống Thi & Đánh giá THPT GD&ĐT 2025
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-rose-950/50 border border-rose-800/80 rounded-2xl flex items-start gap-3 text-rose-300 text-xs sm:text-sm animate-fade-in shadow-inner">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <span className="font-medium leading-relaxed">{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Phone Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Số điện thoại
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Nhập 10 số điện thoại"
                maxLength={10}
                className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all font-medium"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Mật khẩu
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mật khẩu tài khoản"
                className="w-full pl-10 pr-11 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 focus:outline-none cursor-pointer transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Forgot Password */}
          <div className="flex justify-end pt-1">
            <a
              href="#forgot"
              className="text-xs font-semibold text-slate-400 hover:text-indigo-400 transition-colors"
            >
              Quên mật khẩu?
            </a>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-3.5 px-5 rounded-xl shadow-lg shadow-indigo-600/30 transition-all duration-150 active:scale-[0.98] text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer border border-indigo-500/30"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Đang kết nối...</span>
                </>
              ) : (
                <>
                  <span>Đăng nhập hệ thống</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer Link */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 text-center text-xs text-slate-400 font-medium">
          Bạn chưa có tài khoản?{" "}
          <Link
            to="/register"
            className="font-bold text-indigo-400 hover:text-indigo-300 hover:underline ml-1"
          >
            Đăng ký học sinh mới
          </Link>
        </div>
      </div>
    </div>
  );
}

