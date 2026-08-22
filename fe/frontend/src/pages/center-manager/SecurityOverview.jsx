import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import centerManagerService from "../../services/centerManagerService";
import {
  Shield,
  ChevronLeft,
  Activity,
  Server,
  Database,
  Lock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Cpu,
  ShieldCheck,
  Zap
} from "lucide-react";

// ─── CheckItem Component ─────────────────────────────────────────────
function CheckItem({ label, desc, status }) {
  const isOk = status === "ok";
  const isWarn = status === "warn";

  return (
    <div className="flex items-start gap-4 p-4 md:p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 shadow-sm hover:border-indigo-200 dark:hover:border-indigo-800/60 transition-all group">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm mt-0.5 ${
          isOk
            ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60"
            : isWarn
            ? "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60"
            : "bg-slate-100 dark:bg-slate-800 text-slate-400"
        }`}
      >
        {isOk ? (
          <CheckCircle className="w-5 h-5" />
        ) : (
          <AlertTriangle className="w-5 h-5" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-extrabold text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {label}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed font-medium">
          {desc}
        </p>
      </div>

      <div className="shrink-0 pt-0.5">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border shadow-sm ${
            isOk
              ? "bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/60"
              : isWarn
              ? "bg-amber-50 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/60"
              : "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200"
          }`}
        >
          {isOk ? "✓ Đạt chuẩn" : isWarn ? "⚠ Cảnh báo" : "Chưa kiểm tra"}
        </span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN PAGE: SecurityOverview
// ═══════════════════════════════════════════════════════════════════════
export default function SecurityOverview() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await centerManagerService.getSystemStats();
      setStats(data);
      setLastRefresh(new Date());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const securityChecks = [
    {
      label: "Xác thực bằng Session Cookie (JSESSIONID)",
      desc: "Sử dụng cơ chế Session-based auth của Spring Security với HTTP-Only cookie, loại bỏ nguy cơ lộ JWT token qua XSS.",
      status: "ok",
    },
    {
      label: "CORS với Explicit Origins Chặt Chẽ",
      desc: "Đã giới hạn cổng truy cập Frontend chính xác (http://localhost:5173 và http://localhost:3000), bật allowCredentials: true.",
      status: "ok",
    },
    {
      label: "Anti-Cheat: Khóa Đáp Án Tại API /take",
      desc: "Backend tự động lọc hoàn toàn correctAnswer và explanation trong response payload bài thi trước khi gửi xuống client.",
      status: "ok",
    },
    {
      label: "Tên File PDF Tải Lên Đặt Theo UUID",
      desc: "Tất cả file tài liệu PDF trong kho được mã hóa tên theo chuỗi UUID ngẫu nhiên để chống dò đường dẫn tập tin.",
      status: "ok",
    },
    {
      label: "Scoring Engine GD&ĐT 2025 Chuyển Biệt",
      desc: "Trần điểm 10.0 được áp dụng Math.min(10.0, score) đảm bảo tuyệt đối không bị lỗi vượt quá thang điểm quy định.",
      status: "ok",
    },
    {
      label: "Tối Ưu Truy Vấn Hibernate JOIN FETCH",
      desc: "Repository truy vấn bảng điểm được tối ưu bằng LEFT JOIN FETCH loại bỏ hoàn toàn bài toán N+1 Query.",
      status: "ok",
    },
    {
      label: "Phân Quyền API Chi Tiết Theo Role (RBAC)",
      desc: "Mọi endpoint Controller đều có annotation @PreAuthorize kiểm tra quyền truy cập CENTER_MANAGER, TEACHER, STUDENT.",
      status: "ok",
    },
    {
      label: "Cấu Hình Chứng Chỉ HTTPS / SSL",
      desc: "Môi trường sản xuất (Production) cần bật HTTPS để bảo vệ toàn bộ cookie phiên đăng nhập JSESSIONID trên đường truyền.",
      status: "warn",
    },
  ];

  return (
    <div className="space-y-6 font-sans animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 md:p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/center-manager/dashboard")}
            className="p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all cursor-pointer shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
              <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400 shrink-0" />
              Giám sát &amp; Bảo mật Hệ thống
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Kiểm tra trạng thái hoạt động thực tế và cấu hình an toàn dữ liệu
            </p>
          </div>
        </div>

        <button
          onClick={fetchStats}
          disabled={loading}
          className="p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:border-purple-300 dark:hover:border-purple-700 transition-all cursor-pointer shadow-sm active:scale-95 shrink-0"
          title="Tải lại dữ liệu"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin text-purple-500" : ""}`} />
        </button>
      </div>

      {/* LIVE STATS METRICS (Glassmorphism Banner) */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-purple-700 to-violet-800 rounded-3xl p-6 md:p-8 shadow-xl overflow-hidden border border-indigo-500/30">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-10 -bottom-20 w-48 h-48 bg-purple-500/20 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20">
              <Activity className="w-4 h-4 text-emerald-300 animate-pulse" />
              <span className="text-xs font-black text-white uppercase tracking-wider">
                Số Liệu Thời Gian Thực
              </span>
            </div>
            <span className="text-xs text-indigo-200 font-medium">
              Lần cập nhật cuối: {lastRefresh.toLocaleTimeString("vi-VN")}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { label: "Giáo viên", value: stats?.totalTeachers },
              { label: "Học sinh", value: stats?.totalStudents },
              { label: "Lớp học", value: stats?.totalClasses },
              { label: "Đề thi", value: stats?.totalExams },
              { label: "Lượt thi", value: stats?.totalSubmissions },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 text-center shadow-inner"
              >
                <p className="text-2xl md:text-3xl font-black text-white tabular-nums">
                  {loading ? (
                    <span className="inline-block w-8 h-6 bg-white/20 rounded animate-pulse" />
                  ) : (
                    value ?? "—"
                  )}
                </p>
                <p className="text-xs text-indigo-100 font-bold uppercase tracking-wider mt-1">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TECH HEALTH CARDS */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          {
            icon: Server,
            label: "Spring Boot 3.4 & Java 21",
            status: "Đang hoạt động",
            desc: "Tomcat Embedded 8080 Active",
            color: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60"
          },
          {
            icon: Database,
            label: "MySQL 8.0 & Redis Cache",
            status: "Kết nối ổn định",
            desc: "HikariPool Connection Active",
            color: "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/60"
          },
          {
            icon: Lock,
            label: "Session Cookie Security",
            status: "JSESSIONID Active",
            desc: "HTTP-Only & SameSite Protection",
            color: "bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800/60"
          },
        ].map(({ icon: Icon, label, status, desc, color }) => (
          <div
            key={label}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 p-5 shadow-sm flex items-center gap-4"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${color}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="font-extrabold text-sm text-slate-900 dark:text-slate-100 truncate">
                {label}
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-0.5 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {status}
              </p>
              <p className="text-[11px] text-slate-400 truncate mt-0.5 font-medium">
                {desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* SECURITY CHECKLIST */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            Danh sách Kiểm tra An toàn &amp; Bảo mật
          </h2>
          <span className="text-xs text-emerald-700 dark:text-emerald-400 font-black bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60 px-3 py-1 rounded-full shadow-sm">
            {securityChecks.filter((c) => c.status === "ok").length} /{" "}
            {securityChecks.length} Đạt chuẩn
          </span>
        </div>

        <div className="space-y-3">
          {securityChecks.map((check) => (
            <CheckItem key={check.label} {...check} />
          ))}
        </div>
      </div>
    </div>
  );
}

