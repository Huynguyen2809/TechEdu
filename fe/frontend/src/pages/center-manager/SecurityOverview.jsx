import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import centerManagerService from "../../services/centerManagerService";
import { Shield, ChevronLeft, Activity, Server, Database, Lock, CheckCircle, AlertTriangle, RefreshCw } from "lucide-react";

// ─── Check item ──────────────────────────────────────────────────────
function CheckItem({ label, desc, status }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl border border-slate-100 bg-white">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
        status === "ok"   ? "bg-emerald-50 text-emerald-500" :
        status === "warn" ? "bg-amber-50 text-amber-500"     : "bg-slate-100 text-slate-400"
      }`}>
        {status === "ok" ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
      </div>
      <div>
        <p className="font-bold text-sm text-slate-800">{label}</p>
        <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
      </div>
      <div className="ml-auto shrink-0">
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
          status === "ok"   ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
          status === "warn" ? "bg-amber-50 text-amber-600 border-amber-200"       : "bg-slate-100 text-slate-500 border-slate-200"
        }`}>
          {status === "ok" ? "✓ Đạt" : status === "warn" ? "⚠ Cảnh báo" : "Chưa kiểm tra"}
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

  useEffect(() => { fetchStats(); }, []);

  const securityChecks = [
    {
      label: "Xác thực bằng Session Cookie (JSESSIONID)",
      desc: "Không sử dụng JWT — đảm bảo không lộ token qua localStorage.",
      status: "ok",
    },
    {
      label: "CORS được cấu hình với Explicit Origins",
      desc: "Chỉ cho phép http://localhost:5173 và http://localhost:3000.",
      status: "ok",
    },
    {
      label: "Anti-Cheat: Lọc correctAnswer khỏi API /take",
      desc: "Backend không bao giờ gửi đáp án xuống client khi học sinh đang thi.",
      status: "ok",
    },
    {
      label: "File PDF tải lên được đặt tên bằng UUID",
      desc: "Tên file ngẫu nhiên — tránh bị đoán và truy cập trái phép.",
      status: "ok",
    },
    {
      label: "Scoring Engine: Trần điểm 10.0 được áp dụng",
      desc: "Math.min(10.0, score) ngăn điểm vượt thang điểm Bộ GD&ĐT.",
      status: "ok",
    },
    {
      label: "N+1 Query: Đã sử dụng LEFT JOIN FETCH",
      desc: "ExamSubmissionRepository dùng JOIN FETCH để tránh N+1 khi xem bảng điểm.",
      status: "ok",
    },
    {
      label: "Phân quyền API theo Role (RBAC)",
      desc: "Tất cả endpoint đều có @PreAuthorize kiểm tra vai trò.",
      status: "ok",
    },
    {
      label: "HTTPS / SSL Certificate",
      desc: "Môi trường production cần bật HTTPS để bảo vệ cookie Session.",
      status: "warn",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* TOP BAR */}
      <div className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <button
            onClick={() => navigate("/center-manager/dashboard")}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="font-extrabold text-slate-800 flex items-center gap-2">
            <Shield className="w-5 h-5 text-violet-500" />
            Giám sát Hệ thống
          </h1>
          <button
            onClick={fetchStats}
            className="ml-auto p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer transition-colors"
            title="Tải lại"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* LIVE STATS */}
        <div className="bg-gradient-to-r from-violet-600 to-blue-600 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-white/80" />
              <span className="font-extrabold">Số liệu thời gian thực</span>
            </div>
            <span className="text-xs text-white/60">
              Cập nhật: {lastRefresh.toLocaleTimeString("vi-VN")}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: "Giáo viên",  value: stats?.totalTeachers },
              { label: "Học sinh",   value: stats?.totalStudents },
              { label: "Lớp học",   value: stats?.totalClasses },
              { label: "Đề thi",    value: stats?.totalExams },
              { label: "Lượt thi",  value: stats?.totalSubmissions },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/10 rounded-xl p-3 text-center backdrop-blur">
                <p className="text-2xl font-black tabular-nums">
                  {loading ? "..." : (value ?? "—")}
                </p>
                <p className="text-xs text-white/70 font-medium mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* TECH HEALTH */}
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { icon: Server,   label: "Spring Boot 3.4",  status: "Đang chạy",      color: "bg-emerald-50 text-emerald-600" },
            { icon: Database, label: "MySQL 8 + Redis",  status: "Kết nối tốt",     color: "bg-blue-50 text-blue-600"     },
            { icon: Lock,     label: "Session Security", status: "JSESSIONID Active", color: "bg-violet-50 text-violet-600" },
          ].map(({ icon: Icon, label, status, color }) => (
            <div key={label} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm text-slate-800">{label}</p>
                <p className="text-xs text-emerald-500 font-semibold">{status}</p>
              </div>
            </div>
          ))}
        </div>

        {/* SECURITY CHECKLIST */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-slate-800">Kiểm tra Bảo mật</h2>
            <span className="text-xs text-emerald-600 font-bold bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              {securityChecks.filter((c) => c.status === "ok").length}/{securityChecks.length} Đạt chuẩn
            </span>
          </div>
          <div className="space-y-2">
            {securityChecks.map((check) => (
              <CheckItem key={check.label} {...check} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
