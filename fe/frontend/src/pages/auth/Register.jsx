import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import authService from "../../services/authService";
import {
  Phone,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 cyber:bg-[#F8FAFC] flex items-center justify-center p-4 page-transition relative overflow-hidden">
      {/* Container Card chính */}
      <div className="max-w-[480px] w-full bg-white dark:bg-slate-900 cyber:bg-white rounded-2xl shadow-xl dark:shadow-none border border-slate-200/80 dark:border-slate-800 cyber:border-2 cyber:border-slate-900 cyber:shadow-[8px_8px_0_0_#0f172a] cyber:rounded-2xl p-8 sm:p-10 transition-all">
        {/* Tiêu đề */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 cyber:text-slate-900">
            Đăng ký tài khoản học viên
          </h1>
        </div>

        {/* Thông báo thành công */}
        {success ? (
          <div className="py-8 text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto animate-bounce cyber:text-emerald-700" />
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 cyber:text-slate-900">
              Tạo tài khoản thành công!
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 cyber:text-slate-700">
              Hệ thống đang tự động chuyển hướng đến màn hình Đăng nhập...
            </p>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Cảnh báo lỗi */}
            {error && (
              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-xl flex items-center gap-2.5 text-rose-600 dark:text-rose-400 text-sm animate-shake cyber:bg-rose-100 cyber:text-slate-900 cyber:border-2 cyber:border-slate-900 cyber:shadow-[3px_3px_0_0_#0f172a]">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Input Họ tên */}
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 cyber:text-slate-900">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Họ tên"
                  className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-all cyber:bg-white cyber:border-2 cyber:border-slate-900 cyber:shadow-[4px_4px_0_0_#0f172a] cyber:rounded-xl cyber:text-slate-900 cyber:focus:translate-x-[2px] cyber:focus:translate-y-[2px] cyber:focus:shadow-[2px_2px_0_0_#0f172a]"
                />
              </div>
            </div>

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
                  placeholder="Mật khẩu (tối thiểu 6 ký tự)"
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

            {/* Điều khoản sử dụng */}
            <div className="pt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed cyber:text-slate-700">
              Bằng cách bấm vào nút "Đăng ký", tôi đồng ý với{" "}
              <a
                href="#terms"
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium cyber:text-indigo-600 cyber:font-bold"
              >
                Điều Khoản Sử Dụng
              </a>{" "}
              và{" "}
              <a
                href="#privacy"
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium cyber:text-indigo-600 cyber:font-bold"
              >
                Chính Sách Bảo Mật
              </a>{" "}
              của hệ thống.
            </div>

            {/* Nút Đăng ký */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md transition-all text-sm sm:text-base flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer cyber:bg-indigo-600 cyber:text-white cyber:font-bold cyber:border-2 cyber:border-slate-900 cyber:shadow-[4px_4px_0_0_#0f172a] cyber:rounded-xl cyber:hover:-translate-y-0.5 cyber:active:translate-x-1 cyber:active:translate-y-1 cyber:active:shadow-none"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Đang khởi tạo...</span>
                  </>
                ) : (
                  <span>Đăng ký</span>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Chuyển hướng sang Đăng nhập */}
        <div className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400 cyber:text-slate-900">
          Bạn đã có tài khoản?{" "}
          <Link
            to="/login"
            className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline ml-1 cyber:font-bold cyber:text-indigo-600"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
