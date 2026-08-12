import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import classService from "../../services/classService";
import authService from "../../services/authService";
import submissionService from "../../services/submissionService";
import { scoreGrade } from "../../utils/scoreUtils";
import SubmissionDetailModal from "../../components/exam/SubmissionDetailModal";
import {
  Clock,
  CheckCircle2,
  Star,
  TrendingUp,
  Award,
  PlayCircle,
  History,
  AlertCircle,
  Check,
  ChevronRight,
  Flame,
  Plus,
  X,
  BookOpen
} from "lucide-react";

function formatDate(isoString) {
  if (!isoString) return "—";
  return new Date(isoString).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Cập nhật constants theo Clean UI + Glassmorphism
const CARD = "bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm";
const CARD_HOVER = `${CARD} hover:-translate-y-1 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 group`;
const BTN_PRIMARY = "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-semibold rounded-xl shadow-sm hover:shadow-md active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2";
const BTN_SECONDARY = "bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 font-semibold rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2";
const ICON_BOX = "w-10 h-10 rounded-xl flex items-center justify-center border border-slate-200/60 dark:border-slate-700/60 shrink-0 group-hover:scale-110 transition-transform duration-300";

const DashboardSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-pulse">
    <div className="lg:col-span-7 space-y-4">
      <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/3 mb-4"></div>
      {[1, 2].map(i => (
        <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl h-40 w-full border border-slate-200/60 dark:border-slate-800/60 p-5 flex flex-col justify-between">
          <div className="space-y-3">
             <div className="flex gap-2"><div className="w-16 h-5 bg-slate-200 dark:bg-slate-800 rounded-full"></div><div className="w-24 h-5 bg-slate-200 dark:bg-slate-800 rounded-full"></div></div>
             <div className="w-3/4 h-6 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
             <div className="w-1/2 h-4 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
          </div>
        </div>
      ))}
    </div>
    <div className="lg:col-span-5 space-y-4">
      <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mb-4"></div>
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl h-20 w-full border border-slate-200/60 dark:border-slate-800/60 flex items-center p-4 gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-800 shrink-0"></div>
          <div className="space-y-2 flex-1">
             <div className="w-full h-4 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
             <div className="w-2/3 h-3 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default function StudentDashboard() {
  const navigate = useNavigate();

  const [studentName, setStudentName] = useState("Học sinh");
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinMessage, setJoinMessage] = useState({ text: "", type: "" });
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);

  const fetchData = useCallback(async () => {
    let mounted = true;
    try {
      const [userProfile, classesList, historyList] = await Promise.all([
        authService.getCurrentUser(),
        classService.getMyClasses(),
        submissionService.getMyHistory().catch(() => []),
      ]);
      const classes = Array.isArray(classesList) ? classesList : [];

      const examArrays = await Promise.all(
        classes.map(cls =>
          classService.getExamsForClass(cls.id)
            .then(exams => (Array.isArray(exams) ? exams : []).map(e => ({ ...e, className: cls.name, subjectName: cls.subjectName })))
            .catch(err => { console.error(`Lỗi tải đề thi lớp ${cls.id}:`, err); return []; })
        )
      );

      if (!mounted) return;
      setStudentName(userProfile?.fullName || userProfile?.name || "Học sinh");
      setHistory(Array.isArray(historyList) ? historyList : []);
      setUpcomingExams(examArrays.flat());
    } catch (error) {
      console.error("Lỗi tải dữ liệu Dashboard học sinh:", error);
    } finally {
      if (mounted) setLoading(false);
    }
    return () => { mounted = false; };
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleQuickJoin = async (e) => {
    e.preventDefault();
    setJoinMessage({ text: "", type: "" });
    if (!joinCode.trim()) {
      setJoinMessage({ text: "Vui lòng nhập mã tham gia lớp học.", type: "error" });
      return;
    }
    setJoinLoading(true);
    try {
      await classService.joinClassByCode(joinCode.trim());
      setJoinMessage({ text: "Gia nhập lớp học thành công!", type: "success" });
      setJoinCode("");
      setTimeout(() => { setIsJoinModalOpen(false); setJoinMessage({ text: "", type: "" }); }, 1200);
      fetchData();
    } catch (err) {
      setJoinMessage({ text: err.response?.data?.message || "Mã lớp không hợp lệ hoặc bạn đã tham gia lớp này rồi.", type: "error" });
    } finally {
      setJoinLoading(false);
    }
  };

  const avgScore = history.length ? (history.reduce((s, h) => s + Number(h.totalScore || 0), 0) / history.length).toFixed(2) : "—";
  const bestScore = history.length ? Math.max(...history.map((h) => Number(h.totalScore || 0))).toFixed(2) : "—";
  const avgGrade = scoreGrade(avgScore);
  const now = new Date();
  const pendingExams = upcomingExams.filter((e) => {
    const start = new Date(e.startTime);
    const end = new Date(e.endTime);
    return !e.hasSubmitted && now >= start && now <= end;
  });
  const recentHistory = history.slice(0, 4);

  return (
    <div className="space-y-6 font-sans">
      {/* ── BANNER (Glassmorphism & Gradient) ── */}
      <div className="relative rounded-3xl p-6 sm:p-8 text-white overflow-hidden shadow-lg border border-indigo-500/30">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 z-0"></div>
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none z-0"></div>
        <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-indigo-400/20 rounded-full blur-2xl pointer-events-none z-0"></div>
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="bg-white/10 backdrop-blur-md text-white/90 border border-white/20 text-[11px] font-semibold px-3 py-1 rounded-full inline-flex items-center gap-1.5 shadow-sm">
              <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" /> CỔNG THÔNG TIN HỌC SINH
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-1 text-white">Xin chào, {studentName}</h1>
              <p className="text-indigo-100 text-sm font-medium max-w-xl opacity-90">Theo dõi lịch thi trực tuyến và tra cứu kết quả rèn luyện của bạn.</p>
            </div>
          </div>
          <div className="shrink-0">
            <button
              onClick={() => {
                setJoinCode("");
                setJoinMessage({ text: "", type: "" });
                setIsJoinModalOpen(true);
              }}
              className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md px-5 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 border border-white/20 shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.15)] active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              <span>Tham Gia Lớp Mới</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── THỐNG KÊ NHANH ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Card 1: Điểm TB */}
        <div className={`${CARD_HOVER} p-5 flex items-center justify-between`}>
          <div className="space-y-1.5">
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Điểm Trung Bình</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">{avgScore}</span>
              {avgScore !== "—" && <span className="text-sm font-semibold text-slate-500">/10</span>}
            </div>
            {avgScore !== "—" && (
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${avgGrade.color.replace('text-', 'bg-').replace('600', '100').replace('400', '900/40')} ${avgGrade.color} inline-block`}>
                Xếp loại: {avgGrade.label}
              </span>
            )}
          </div>
          <div className={`${ICON_BOX} w-12 h-12 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800/60 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600`}>
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Đã hoàn thành */}
        <div className={`${CARD_HOVER} p-5 flex items-center justify-between`}>
          <div className="space-y-1.5">
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Đã Hoàn Thành</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">{history.length}</span>
              <span className="text-sm font-semibold text-slate-500">bài thi</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Đã nộp bài thành công</p>
          </div>
          <div className={`${ICON_BOX} w-12 h-12 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/60 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600`}>
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Điểm cao nhất */}
        <div className={`${CARD_HOVER} p-5 flex items-center justify-between`}>
          <div className="space-y-1.5">
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Điểm Cao Nhất</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-amber-600 dark:text-amber-400 tracking-tight">{bestScore}</span>
              {bestScore !== "—" && <span className="text-sm font-semibold text-slate-500">/10</span>}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Kỷ lục bài thi cá nhân</p>
          </div>
          <div className={`${ICON_BOX} w-12 h-12 bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800/60 group-hover:bg-amber-500 group-hover:text-white group-hover:border-amber-500`}>
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ── BỐ CỤC 2 CỘT ── */}
      {loading ? (
        <DashboardSkeleton />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* CỘT TRÁI: Bài kiểm tra cần làm */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                <span>Bài kiểm tra cần làm</span>
                {pendingExams.length > 0 && (
                  <span className="text-[11px] font-bold bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400 px-2.5 py-0.5 rounded-full border border-orange-200 dark:border-orange-800/60">
                    {pendingExams.length}
                  </span>
                )}
              </h2>
            </div>

            {pendingExams.length === 0 ? (
              <div className={`${CARD} py-16 px-6 text-center space-y-4 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-900/50 border-dashed`}>
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm">
                  <BookOpen className="w-8 h-8 text-slate-400" />
                </div>
                <div>
                  <p className="text-base font-bold text-slate-700 dark:text-slate-200">
                    Bạn đã hoàn thành mọi bài tập!
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                    Hiện tại không có bài kiểm tra nào cần làm. Hãy kiểm tra lại lịch thi sau hoặc tham gia lớp học mới nhé.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingExams.map((exam) => (
                  <div key={exam.id} className={`${CARD_HOVER} p-5 flex flex-col justify-between space-y-5 bg-white dark:bg-slate-900`}>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 border border-sky-100 dark:border-sky-800/60 shadow-sm">
                          ⏳ {exam.durationMinutes} phút
                        </span>
                        <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/60 shadow-sm flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Đang mở làm bài
                        </span>
                      </div>
                      <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-lg line-clamp-2">{exam.title}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <span className="w-1.5 h-4 bg-indigo-500 rounded-full inline-block"></span>
                        Lớp: <strong className="text-slate-700 dark:text-slate-200 font-bold">{exam.className}</strong>
                        {exam.subjectName ? ` · ${exam.subjectName}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/60">
                      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span>Hạn nộp:</span>
                        <strong className="text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 px-2 py-0.5 rounded-md border border-rose-100 dark:border-rose-900/50">{formatDate(exam.endTime)}</strong>
                      </div>
                      <button
                        onClick={() => navigate(`/student/exam/${exam.id}`)}
                        className={`${BTN_PRIMARY} py-2 px-5 text-sm`}
                      >
                        <PlayCircle className="w-4 h-4" />
                        Làm Bài 
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CỘT PHẢI: Kết quả gần nhất */}
          <div className="lg:col-span-5 space-y-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span>Kết quả gần đây</span>
            </h2>

            {recentHistory.length === 0 ? (
               <div className={`${CARD} py-12 px-6 text-center space-y-3 flex flex-col items-center bg-slate-50/50 dark:bg-slate-900/50 border-dashed`}>
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm">
                  <History className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Chưa có bài làm nào hoàn thành</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentHistory.map((item) => {
                  const isPass = Number(item.totalScore) >= 5.0;
                  return (
                    <div key={item.submissionId} className={`${CARD_HOVER} p-4 flex items-center gap-4 bg-white dark:bg-slate-900`}>
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 font-black text-lg tracking-tight shadow-sm border ${isPass
                        ? "bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/60"
                        : "bg-rose-50 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-800/60"
                        }`}>
                        {item.totalScore}
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {item.examTitle}
                        </h4>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">{item.className}</p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDate(item.submittedAt)}</p>
                      </div>
                      <button
                        onClick={() => setSelectedSubmissionId(item.submissionId)}
                        className={`${BTN_SECONDARY} px-3 py-1.5 text-xs shrink-0 rounded-lg`}
                      >
                        Chi tiết
                      </button>
                    </div>
                  );
                })}

                <div className="pt-2 text-right">
                  <button
                    onClick={() => navigate("/student/history")}
                    className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 inline-flex items-center gap-1 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <span>Xem toàn bộ lịch sử</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MODAL GIA NHẬP LỚP (Glassmorphism) ── */}
      {isJoinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200 dark:border-slate-800 transform transition-all">
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white p-6 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-xl leading-tight tracking-tight">
                  Tham Gia Lớp Học
                </h3>
                <p className="text-xs font-medium text-indigo-100 mt-1 opacity-90">
                  Nhận mã lớp từ giáo viên
                </p>
              </div>
              <button
                onClick={() => { setIsJoinModalOpen(false); setJoinMessage({ text: "", type: "" }); }}
                className="text-white/70 hover:text-white hover:bg-white/10 p-1.5 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickJoin} className="p-6 space-y-6">
              {joinMessage.text && (
                <div className={`p-3.5 rounded-xl text-sm flex items-center gap-2.5 font-semibold border shadow-sm ${joinMessage.type === "success"
                  ? "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400"
                  : "bg-rose-50 dark:bg-rose-900/30 border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-400"
                  }`}>
                  {joinMessage.type === "success"
                    ? <Check className="w-5 h-5 shrink-0" />
                    : <AlertCircle className="w-5 h-5 shrink-0" />}
                  <span>{joinMessage.text}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Mã Lớp Học (6-10 ký tự)
                </label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Nhập mã lớp..."
                  maxLength={10}
                  className="w-full px-4 py-3.5 bg-slate-50/50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl font-mono text-center tracking-[0.2em] text-xl font-bold text-slate-900 dark:text-slate-100 uppercase focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-sm focus:shadow-md focus:ring-4 focus:ring-indigo-500/10"
                  autoFocus
                  required
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsJoinModalOpen(false); setJoinMessage({ text: "", type: "" }); }}
                  className={`${BTN_SECONDARY} flex-1 py-3 text-sm`}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={joinLoading}
                  className={`${BTN_PRIMARY} flex-1 py-3 text-sm disabled:opacity-70`}
                >
                  {joinLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Đang xử lý</span>
                    </div>
                  ) : "Tham Gia"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL CHI TIẾT BÀI THI ── */}
      {selectedSubmissionId && (
        <SubmissionDetailModal
          submissionId={selectedSubmissionId}
          onClose={() => setSelectedSubmissionId(null)}
        />
      )}
    </div>
  );
}
