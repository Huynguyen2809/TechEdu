import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import authService from "../../services/authService";
import { Phone, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { loginSuccess } = useAuth();

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

      // Lấy profile user sau khi Server cấp Session Cookie
      const userData = await authService.getCurrentUser();
      loginSuccess(userData);

      // Điều hướng theo trạng thái đăng nhập lần đầu
      if (userData.isFirstLogin) {
        navigate("/force-change-password");
        return;
      }

      // Điều hướng theo vai trò (RBAC)
      if (userData.role === "CENTER_MANAGER" || userData.role === "DEPARTMENT_HEAD") {
        navigate("/center-manager/dashboard");
      } else if (userData.role === "TEACHER") {
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 cyber:bg-[#F8FAFC] flex items-center justify-center p-4 page-transition relative overflow-hidden">
      {/* Container Card chính */}
      <div className="max-w-[450px] w-full bg-white dark:bg-slate-900 cyber:bg-white rounded-2xl shadow-xl dark:shadow-none border border-slate-200/80 dark:border-slate-800 cyber:border-2 cyber:border-slate-900 cyber:shadow-[8px_8px_0_0_#0f172a] cyber:rounded-2xl p-8 sm:p-10 transition-all">
        {/* Tiêu đề */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 cyber:text-slate-900">
            Đăng nhập
          </h1>
        </div>

        {/* Cảnh báo lỗi */}
        {error && (
          <div className="mb-6 p-3.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-xl flex items-center gap-2.5 text-rose-600 dark:text-rose-400 text-sm animate-shake cyber:bg-rose-100 cyber:text-slate-900 cyber:border-2 cyber:border-slate-900 cyber:shadow-[3px_3px_0_0_#0f172a]">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Input Số điện thoại */}
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 cyber:text-slate-900">
                <Phone className="w-5 h-5" />
              </div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Nhập số điện thoại"
                maxLength={10}
                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-all cyber:bg-white cyber:border-2 cyber:border-slate-900 cyber:shadow-[4px_4px_0_0_#0f172a] cyber:rounded-xl cyber:text-slate-900 cyber:focus:translate-x-[2px] cyber:focus:translate-y-[2px] cyber:focus:shadow-[2px_2px_0_0_#0f172a]"
              />
            </div>
          </div>

          {/* Input Mật khẩu */}
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 cyber:text-slate-900">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mật khẩu"
                className="w-full pl-11 pr-11 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-all cyber:bg-white cyber:border-2 cyber:border-slate-900 cyber:shadow-[4px_4px_0_0_#0f172a] cyber:rounded-xl cyber:text-slate-900 cyber:focus:translate-x-[2px] cyber:focus:translate-y-[2px] cyber:focus:shadow-[2px_2px_0_0_#0f172a]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 cyber:text-slate-900 cyber:hover:text-indigo-600 focus:outline-none cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Link Quên mật khẩu */}
          <div className="flex justify-start pt-1">
            <a
              href="#forgot"
              className="text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cyber:text-slate-900 cyber:hover:text-indigo-600 cyber:font-bold"
            >
              Quên mật khẩu?
            </a>
          </div>

          {/* Nút Đăng nhập */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md transition-all text-sm sm:text-base flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer cyber:bg-indigo-600 cyber:text-white cyber:font-bold cyber:border-2 cyber:border-slate-900 cyber:shadow-[4px_4px_0_0_#0f172a] cyber:rounded-xl cyber:hover:-translate-y-0.5 cyber:active:translate-x-1 cyber:active:translate-y-1 cyber:active:shadow-none"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <span>Đăng nhập</span>
              )}
            </button>
          </div>
        </form>

        {/* Chuyển hướng sang Đăng ký */}
        <div className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400 cyber:text-slate-900">
          Bạn chưa có tài khoản?{" "}
          <Link
            to="/register"
            className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline ml-1 cyber:font-bold cyber:text-indigo-600"
          >
            Tạo một tài khoản mới
          </Link>
        </div>
      </div>
    </div>
  );
}
