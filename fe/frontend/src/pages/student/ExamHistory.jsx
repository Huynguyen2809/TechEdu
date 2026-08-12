import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import submissionService from "../../services/submissionService";
import { scoreGrade } from "../../utils/scoreUtils";
import SubmissionDetailModal from "../../components/exam/SubmissionDetailModal";
import {
  BookOpen,
  Clock,
  Calendar,
  ChevronRight,
  TrendingUp,
  Award,
  Search,
  Filter,
  History,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────
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

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m} phút ${s > 0 ? s + "s" : ""}`.trim();
}

// ── Shared tri-theme tokens ─────────────────────────────────────
const CARD = "bg-white dark:bg-slate-900 cyber:bg-white rounded-2xl border border-slate-200/80 dark:border-slate-800 cyber:border-2 cyber:border-slate-900 shadow-sm dark:shadow-none cyber:shadow-[4px_4px_0_0_#0f172a] transition-all duration-150";
const CARD_HOVER = `${CARD} hover:-translate-y-0.5 hover:shadow-md dark:hover:shadow-none cyber:hover:shadow-[6px_6px_0_0_#0f172a] cyber:hover:translate-y-0`;
const ICON_BOX = "w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 border border-slate-200/80 dark:border-slate-700 cyber:border-2 cyber:border-slate-900 shadow-sm dark:shadow-none cyber:shadow-[2px_2px_0_0_#0f172a]";

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE: ExamHistory
// ═══════════════════════════════════════════════════════════════
export default function ExamHistory() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSubmissionId = searchParams.get("submissionId");

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClassFilter, setSelectedClassFilter] = useState("ALL");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await submissionService.getMyHistory();
        if (mounted) setHistory(data || []);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const avgScore = history.length
    ? (history.reduce((s, h) => s + Number(h.totalScore || 0), 0) / history.length).toFixed(2)
    : "—";
  const bestScore = history.length
    ? Math.max(...history.map((h) => Number(h.totalScore || 0))).toFixed(2)
    : "—";

  const activeSubmissionId = selectedSubmissionId || urlSubmissionId;
  const classOptions = Array.from(new Set(history.map((h) => h.className).filter(Boolean)));

  const filteredHistory = history.filter((item) => {
    const matchesSearch = item.examTitle?.toLowerCase().includes(searchQuery.toLowerCase().trim());
    const matchesClass = selectedClassFilter === "ALL" || item.className === selectedClassFilter;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* HEADER */}
      <div className="text-left mb-6">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
          <History className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
          <span>Lịch Sử Làm Bài</span>
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mt-1">
          Xem lại các bài kiểm tra đã hoàn thành và đối chiếu đáp án chi tiết.
        </p>
      </div>

      {/* TỔNG QUAN */}
      {history.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Card 1 */}
            <div className={`${CARD_HOVER} p-4 text-center`}>
              <div className={`${ICON_BOX} bg-indigo-50 dark:bg-indigo-950/60 cyber:bg-indigo-100`}>
                <History className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">{history.length}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Bài đã làm</p>
            </div>

            {/* Card 2 */}
            <div className={`${CARD_HOVER} p-4 text-center`}>
              <div className={`${ICON_BOX} bg-violet-50 dark:bg-purple-950/60 cyber:bg-violet-100`}>
                <TrendingUp className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">{avgScore}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Điểm trung bình</p>
            </div>

            {/* Card 3 */}
            <div className={`${CARD_HOVER} p-4 text-center`}>
              <div className={`${ICON_BOX} bg-amber-50 dark:bg-amber-950/60 cyber:bg-amber-100`}>
                <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight">{bestScore}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Điểm cao nhất</p>
            </div>
          </div>
        )}

        {/* THANH TÌM KIẾM & LỌC */}
        {history.length > 0 && (
          <div className={`${CARD} flex flex-col sm:flex-row items-center justify-between gap-3 p-4`}>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo tên bài thi..."
                className="w-full bg-slate-50 dark:bg-slate-800/60 cyber:bg-slate-50 border border-slate-200 dark:border-slate-700 cyber:border-2 cyber:border-slate-900 text-slate-800 dark:text-slate-100 rounded-xl pl-9 pr-4 py-2 text-sm font-semibold focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 dark:focus:border-indigo-500 transition-all outline-none shadow-none cyber:shadow-[2px_2px_0_0_#0f172a]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
              <select
                value={selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value)}
                className="w-full sm:w-auto bg-slate-50 dark:bg-slate-800/60 cyber:bg-slate-50 border border-slate-200 dark:border-slate-700 cyber:border-2 cyber:border-slate-900 text-slate-800 dark:text-slate-100 rounded-xl px-4 py-2 text-sm font-semibold focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 transition-all outline-none cursor-pointer shadow-none cyber:shadow-[2px_2px_0_0_#0f172a]"
              >
                <option value="ALL" className="dark:bg-slate-900 font-bold">Tất cả các lớp</option>
                {classOptions.map((className) => (
                  <option key={className} value={className} className="dark:bg-slate-900 font-bold">
                    {className}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* DANH SÁCH BÀI THI */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        ) : history.length === 0 ? (
          <div className={`${CARD} flex flex-col items-center py-20 gap-4`}>
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/60 cyber:bg-blue-100 rounded-2xl flex items-center justify-center border border-slate-200 dark:border-blue-900/60 cyber:border-2 cyber:border-slate-900 shadow-sm cyber:shadow-[2px_2px_0_0_#0f172a]">
              <History className="w-8 h-8 text-indigo-600 dark:text-blue-400" />
            </div>
            <div className="text-center">
              <p className="font-bold text-lg text-slate-800 dark:text-slate-100 tracking-tight">Chưa có bài thi nào</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Hãy hoàn thành một bài kiểm tra để xem lịch sử tại đây.</p>
            </div>
            <button
              onClick={() => navigate("/student/my-classes")}
              className="mt-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 cyber:bg-indigo-600 text-white font-semibold text-sm rounded-xl border border-transparent cyber:border-2 cyber:border-slate-900 shadow-sm cyber:shadow-[3px_3px_0_0_#0f172a] cyber:active:translate-x-0.5 cyber:active:translate-y-0.5 cyber:active:shadow-none cursor-pointer transition-all"
            >
              Vào Lớp Học
            </button>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className={`${CARD} text-center py-12 px-4 space-y-2`}>
            <p className="font-bold text-slate-800 dark:text-slate-100 text-base tracking-tight">Không tìm thấy bài thi phù hợp</p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc lớp học.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredHistory.map((item) => {
              const grade = scoreGrade(item.totalScore);
              return (
                <button
                  key={item.submissionId}
                  onClick={() => setSelectedSubmissionId(item.submissionId)}
                  className={`${CARD_HOVER} w-full p-4 flex items-center gap-4 cursor-pointer text-left group`}
                >
                  {/* Score badge */}
                  <div className={`w-16 h-14 rounded-xl flex flex-col items-center justify-center shrink-0 ${grade.color} cyber:shadow-[2px_2px_0_0_#0f172a] dark:shadow-none`}>
                    <span className="text-base font-black leading-none tracking-tight">
                      {item.totalScore}
                      <span className="text-[10px] font-bold opacity-75 ml-0.5">/10</span>
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="font-bold text-slate-800 dark:text-slate-100 truncate tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-sm sm:text-base">
                      {item.examTitle}
                    </p>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
                      {item.className} · {item.subjectName}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDuration(item.timeSpentSeconds)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(item.submittedAt)}
                      </span>
                    </div>
                  </div>

                  {/* Grade tag + arrow */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`hidden sm:inline-flex text-xs font-semibold px-3 py-1 rounded-lg ${grade.color} cyber:shadow-[2px_2px_0_0_#0f172a] dark:shadow-none`}>
                      {grade.label}
                    </span>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </button>
              );
            })}
          </div>
        )}

      {/* MODAL CHI TIẾT BÀI THI */}
      {activeSubmissionId && (
        <SubmissionDetailModal
          submissionId={activeSubmissionId}
          onClose={() => {
            setSelectedSubmissionId(null);
            setSearchParams({});
          }}
        />
      )}
    </div>
  );
}
