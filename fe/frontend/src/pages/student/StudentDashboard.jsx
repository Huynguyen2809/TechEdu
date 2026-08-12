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
  FileText,
  History,
  AlertCircle,
  Check,
  ChevronRight,
  Flame,
  Plus,
  X,
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


const CARD = "bg-white dark:bg-slate-900 cyber:bg-white rounded-2xl border border-slate-200/80 dark:border-slate-800 cyber:border-2 cyber:border-slate-900 shadow-sm dark:shadow-none cyber:shadow-[3px_3px_0_0_#0f172a]";
const CARD_HOVER = `${CARD} hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group`;
const BTN_PRIMARY = "bg-indigo-600 dark:bg-indigo-500 cyber:bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-400 cyber:hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-sm cyber:border-2 cyber:border-slate-900 cyber:shadow-[3px_3px_0_0_#0f172a] cyber:active:translate-x-0.5 cyber:active:translate-y-0.5 cyber:active:shadow-none transition-all cursor-pointer";
const BTN_SECONDARY = "bg-white dark:bg-slate-800 cyber:bg-white hover:bg-slate-50 dark:hover:bg-slate-700 cyber:hover:bg-slate-100 text-slate-700 dark:text-slate-200 cyber:text-slate-900 font-semibold rounded-xl border border-slate-200 dark:border-slate-700 cyber:border-2 cyber:border-slate-900 shadow-sm cyber:shadow-[2px_2px_0_0_#0f172a] cyber:active:translate-x-0.5 cyber:active:translate-y-0.5 cyber:active:shadow-none transition-all cursor-pointer";
const ICON_BOX = "w-10 h-10 rounded-xl flex items-center justify-center border border-slate-200/60 dark:border-slate-700/60 shrink-0 group-hover:scale-110 transition-transform duration-300";

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

      // BUG-04: Chuyển for...of sang Promise.all() tải song song
      const examArrays = await Promise.all(
        classes.map(cls =>
          classService.getExamsForClass(cls.id)
            .then(exams => (Array.isArray(exams) ? exams : []).map(e => ({ ...e, className: cls.name, subjectName: cls.subjectName })))
            .catch(err => { console.error(`Lỗi tải đề thi lớp ${cls.id}:`, err); return []; })
        )
      );

      if (!mounted) return; // BUG-06: Kiểm tra isMounted
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
      {/* ── BANNER ── */}
      <div className="bg-indigo-600 rounded-2xl p-5 md:p-6 text-white shadow-md cyber:shadow-[6px_6px_0_0_#0f172a] cyber:border-2 cyber:border-slate-900 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative z-10 space-y-1">
          <div className="bg-white/15 backdrop-blur-md text-white/90 border border-white/20 text-[11px] font-semibold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
            <Star className="w-3 h-3 text-amber-300 fill-amber-300" /> CỔNG THÔNG TIN HỌC SINH
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">Xin chào, {studentName}</h1>
          <p className="text-indigo-100 text-xs font-medium max-w-xl">Theo dõi lịch thi trực tuyến và tra cứu kết quả rèn luyện của bạn.</p>
        </div>
        <div className="relative z-10 shrink-0">
          <button
            onClick={() => {
              setJoinCode("");
              setJoinMessage({ text: "", type: "" });
              setIsJoinModalOpen(true);
            }}
            className="bg-white/20 hover:bg-white/30 cyber:bg-white cyber:text-slate-900 cyber:hover:bg-slate-100 text-white backdrop-blur-md px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer border border-white/20 cyber:border-2 cyber:border-slate-900 shadow-sm cyber:shadow-[3px_3px_0_0_#0f172a] cyber:hover:translate-x-0.5 cyber:hover:translate-y-0.5 cyber:hover:shadow-none active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>Tham Gia Lớp Mới</span>
          </button>
        </div>
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none cyber:hidden" />
      </div>

      {/* ── THỐNG KÊ NHANH ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Điểm TB */}
        <div className={`${CARD_HOVER} p-4 flex items-center justify-between hover:border-indigo-400 dark:hover:border-indigo-600`}>
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Điểm Trung Bình</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-800 dark:text-slate-100 cyber:text-slate-900 tracking-tight">{avgScore}</span>
              {avgScore !== "—" && <span className="text-xs font-semibold text-slate-500">/10</span>}
            </div>
            {avgScore !== "—" && (
              <span className={`text-[10px] ${avgGrade.color} inline-block`}>Xếp loại: {avgGrade.label}</span>
            )}
          </div>
          <div className={`${ICON_BOX} bg-indigo-50 dark:bg-indigo-950/60 cyber:bg-indigo-100 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/60 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300`}>
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Đã hoàn thành */}
        <div className={`${CARD_HOVER} p-4 flex items-center justify-between hover:border-violet-400 dark:hover:border-violet-600`}>
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Đã Hoàn Thành</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-800 dark:text-slate-100 cyber:text-slate-900 tracking-tight">{history.length}</span>
              <span className="text-xs font-semibold text-slate-500">bài thi</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Đã nộp bài thành công</p>
          </div>
          <div className={`${ICON_BOX} bg-violet-50 dark:bg-violet-950/60 cyber:bg-violet-100 text-violet-600 dark:text-violet-400 border-violet-100 dark:border-violet-900/60 group-hover:scale-110 group-hover:bg-violet-600 group-hover:text-white transition-all duration-300`}>
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Điểm cao nhất */}
        <div className={`${CARD_HOVER} p-4 flex items-center justify-between hover:border-amber-400 dark:hover:border-amber-600`}>
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Điểm Cao Nhất</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight">{bestScore}</span>
              {bestScore !== "—" && <span className="text-xs font-semibold text-slate-500">/10</span>}
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Kỷ lục bài thi cá nhân</p>
          </div>
          <div className={`${ICON_BOX} bg-amber-50 dark:bg-amber-950/60 cyber:bg-amber-100 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/60 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300`}>
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── BỐ CỤC 2 CỘT ── */}
      {loading ? (
        <div className={`${CARD} py-16 text-center`}>
          <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 mt-3">Đang tải dữ liệu trang chủ...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* CỘT TRÁI: Bài kiểm tra cần làm */}
          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 cyber:text-slate-900 tracking-tight flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <span>Bài kiểm tra cần làm</span>
              {pendingExams.length > 0 && (
                <span className="text-xs font-semibold bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-full border border-orange-200 dark:border-orange-800">
                  {pendingExams.length}
                </span>
              )}
            </h2>

            {pendingExams.length === 0 ? (
              <div className={`${CARD} py-12 px-6 text-center space-y-3`}>
                <div className={`${ICON_BOX} mx-auto bg-emerald-100 dark:bg-emerald-950/60 cyber:bg-emerald-100 text-emerald-600 dark:text-emerald-400 w-12 h-12`}>
                  <Star className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 cyber:text-slate-900">
                  Hiện tại bạn không có bài kiểm tra nào cần làm.
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Hãy thư giãn hoặc kiểm tra lịch thi trong các lớp học của bạn.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingExams.map((exam) => (
                  <div key={exam.id} className={`${CARD_HOVER} p-5 flex flex-col justify-between space-y-4`}>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/60 cyber:bg-sky-300 text-sky-700 dark:text-sky-300 cyber:text-slate-900 border border-sky-200 dark:border-sky-800 cyber:border-2 cyber:border-slate-900">
                          {exam.durationMinutes} phút
                        </span>
                        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 cyber:bg-emerald-300 text-emerald-700 dark:text-emerald-300 cyber:text-slate-900 border border-emerald-200 dark:border-emerald-800 cyber:border-2 cyber:border-slate-900">
                          ● Đang mở làm bài
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-100 cyber:text-slate-900 tracking-tight text-base">{exam.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Lớp: <strong className="text-slate-700 dark:text-slate-200 cyber:text-slate-900">{exam.className}</strong>
                        {exam.subjectName ? ` · ${exam.subjectName}` : ""}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800 cyber:border-t-2 cyber:border-slate-900">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Hạn nộp: <strong className="text-rose-600 dark:text-rose-400 ml-1">{formatDate(exam.endTime)}</strong>
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/student/exam/${exam.id}`)}
                      className={`${BTN_PRIMARY} w-full py-2.5 px-4 flex items-center justify-center gap-2`}
                    >
                      <PlayCircle className="w-4 h-4" />
                      <span>VÀO LÀM BÀI NGAY</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CỘT PHẢI: Kết quả gần nhất */}
          <div className="lg:col-span-5 space-y-4">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 cyber:text-slate-900 tracking-tight flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span>Kết quả bài làm gần nhất</span>
            </h2>

            {recentHistory.length === 0 ? (
              <div className={`${CARD} py-12 px-6 text-center space-y-3`}>
                <div className={`${ICON_BOX} mx-auto bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 w-12 h-12`}>
                  <History className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Chưa có bài làm nào hoàn thành</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentHistory.map((item) => {
                  const isPass = Number(item.totalScore) >= 5.0;
                  return (
                    <div key={item.submissionId} className={`${CARD_HOVER} p-4 flex items-center gap-3.5 group`}>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-black text-sm tracking-tight cyber:border-2 cyber:border-slate-900 cyber:shadow-[2px_2px_0_0_#0f172a] ${isPass
                        ? "bg-emerald-50 dark:bg-emerald-950/60 cyber:bg-emerald-300 text-emerald-700 dark:text-emerald-300 cyber:text-slate-900"
                        : "bg-rose-50 dark:bg-rose-950/60 cyber:bg-rose-300 text-rose-700 dark:text-rose-300 cyber:text-slate-900"
                        }`}>
                        {item.totalScore}
                      </div>
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <h4 className="font-semibold text-slate-800 dark:text-slate-100 cyber:text-slate-900 text-xs sm:text-sm truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {item.examTitle}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{item.className}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">{formatDate(item.submittedAt)}</p>
                      </div>
                      <button
                        onClick={() => setSelectedSubmissionId(item.submissionId)}
                        className={`${BTN_SECONDARY} px-3 py-1.5 text-xs shrink-0`}
                      >
                        Xem lại
                      </button>
                    </div>
                  );
                })}

                <div className="pt-1 text-right">
                  <button
                    onClick={() => navigate("/student/history")}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 inline-flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <span>Xem tất cả trong Lịch sử làm bài</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MODAL GIA NHẬP LỚP ── */}
      {isJoinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 cyber:bg-white rounded-3xl shadow-xl dark:shadow-2xl cyber:shadow-[8px_8px_0_0_#0f172a] max-w-sm w-full overflow-hidden border border-slate-200 dark:border-slate-800 cyber:border-2 cyber:border-slate-900">
            <div className="bg-indigo-600 text-white p-6 flex items-center justify-between border-b border-indigo-700 dark:border-slate-800 cyber:border-b-2 cyber:border-slate-900">
              <div>
                <h3 className="font-extrabold text-lg leading-tight tracking-tight">
                  Tham Gia Lớp Học
                </h3>
                <p className="text-xs text-indigo-100 mt-0.5">
                  Nhận mã lớp từ giáo viên
                </p>
              </div>
              <button
                onClick={() => { setIsJoinModalOpen(false); setJoinMessage({ text: "", type: "" }); }}
                className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleQuickJoin} className="p-6 space-y-5">
              {joinMessage.text && (
                <div className={`p-3 rounded-xl text-xs flex items-center gap-2 font-semibold border ${joinMessage.type === "success"
                  ? "bg-emerald-50 dark:bg-emerald-950/60 cyber:bg-emerald-50 border border-emerald-200 dark:border-emerald-800/80 cyber:border-2 cyber:border-slate-900 text-emerald-700 dark:text-emerald-400 cyber:text-emerald-700"
                  : "bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800/80 cyber:border-2 cyber:border-slate-900 text-red-600 dark:text-red-400 cyber:text-red-600"
                  }`}>
                  {joinMessage.type === "success"
                    ? <Check className="w-4 h-4 shrink-0" />
                    : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{joinMessage.text}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Mã Lớp Học
                </label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="......"
                  maxLength={10}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/60 cyber:bg-slate-50 border border-slate-200 dark:border-slate-700 cyber:border-2 cyber:border-slate-900 rounded-xl font-mono text-center tracking-widest text-lg font-bold text-slate-900 dark:text-slate-100 uppercase focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 cyber:focus:border-indigo-600 transition-all cyber:shadow-[2px_2px_0_0_#0f172a]"
                  autoFocus
                  required
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsJoinModalOpen(false); setJoinMessage({ text: "", type: "" }); }}
                  className={`${BTN_SECONDARY} flex-1 py-2.5 px-4 text-sm`}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={joinLoading}
                  className={`${BTN_PRIMARY} flex-1 py-2.5 px-4 text-sm disabled:opacity-50`}
                >
                  {joinLoading ? "Đang xử lý..." : "Tham Gia"}
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
