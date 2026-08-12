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
  CheckCircle2,
  FileText
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

// ── Shared Clean UI tokens ─────────────────────────────────────
const CARD = "bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm";
const CARD_HOVER = `${CARD} hover:-translate-y-1 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 group`;
const ICON_BOX = "w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 border border-slate-100 dark:border-slate-800/60 shadow-sm";
const BTN_PRIMARY = "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-semibold rounded-xl shadow-sm hover:shadow-md active:scale-[0.98] transition-all cursor-pointer";

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
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
          Xem lại các bài kiểm tra đã hoàn thành và đối chiếu đáp án chi tiết.
        </p>
      </div>

      {/* TỔNG QUAN */}
      {history.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Card 1 */}
            <div className={`${CARD_HOVER} p-6 text-center`}>
              <div className={`${ICON_BOX} bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors border-indigo-100 dark:border-indigo-800/60`}>
                <History className="w-6 h-6" />
              </div>
              <p className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">{history.length}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">Bài đã làm</p>
            </div>

            {/* Card 2 */}
            <div className={`${CARD_HOVER} p-6 text-center`}>
              <div className={`${ICON_BOX} bg-violet-50 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 group-hover:bg-violet-600 group-hover:text-white transition-colors border-violet-100 dark:border-violet-800/60`}>
                <TrendingUp className="w-6 h-6" />
              </div>
              <p className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">{avgScore}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">Điểm trung bình</p>
            </div>

            {/* Card 3 */}
            <div className={`${CARD_HOVER} p-6 text-center`}>
              <div className={`${ICON_BOX} bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition-colors border-amber-100 dark:border-amber-800/60`}>
                <Award className="w-6 h-6" />
              </div>
              <p className="text-3xl font-black text-amber-600 dark:text-amber-400 tracking-tight">{bestScore}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">Điểm cao nhất</p>
            </div>
          </div>
        )}

        {/* THANH TÌM KIẾM & LỌC */}
        {history.length > 0 && (
          <div className={`${CARD} flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm`}>
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo tên bài thi..."
                className="w-full bg-slate-50/80 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none shadow-sm"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value)}
                className="w-full sm:w-auto bg-slate-50/80 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl px-4 py-2.5 text-sm font-semibold focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none cursor-pointer shadow-sm"
              >
                <option value="ALL" className="font-bold">Tất cả các lớp</option>
                {classOptions.map((className) => (
                  <option key={className} value={className} className="font-bold">
                    {className}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* DANH SÁCH BÀI THI */}
        {loading ? (
          <div className="space-y-4">
             {[1,2,3,4].map(i => (
               <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl h-24 w-full border border-slate-200/60 dark:border-slate-800/60 animate-pulse p-4 flex gap-4">
                  <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0"></div>
                  <div className="space-y-2 flex-1 mt-1">
                    <div className="w-1/2 h-4 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
                    <div className="w-1/3 h-3 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
                  </div>
               </div>
             ))}
          </div>
        ) : history.length === 0 ? (
          <div className={`${CARD} flex flex-col items-center py-24 gap-4 bg-slate-50/50 dark:bg-slate-900/50 border-dashed`}>
            <div className="w-16 h-16 bg-white dark:bg-slate-800 text-indigo-400 dark:text-indigo-500 rounded-2xl flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm">
              <History className="w-8 h-8" />
            </div>
            <div className="text-center max-w-sm">
              <p className="font-bold text-lg text-slate-800 dark:text-slate-100 tracking-tight">Chưa có bài thi nào</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Hãy hoàn thành một bài kiểm tra để xem lịch sử tại đây.</p>
            </div>
            <button
              onClick={() => navigate("/student/classes")}
              className={`${BTN_PRIMARY} px-6 py-2.5 mt-2 inline-flex items-center gap-2`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Vào Lớp Học Ngay</span>
            </button>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className={`${CARD} text-center py-16 px-4 space-y-3 bg-slate-50/50 dark:bg-slate-900/50 border-dashed`}>
            <div className="w-16 h-16 bg-white dark:bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm mx-auto">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-100 text-base tracking-tight">Không tìm thấy bài thi phù hợp</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc lớp học.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map((item) => {
              const grade = scoreGrade(item.totalScore);
              // Clean up the colors to look softer and modern
              const badgeClass = grade.color.replace('text-', 'bg-').replace('600', '100').replace('400', '900/40') + " text-" + grade.color.split('text-')[1].split(' ')[0] + " border-" + grade.color.split('text-')[1].split(' ')[0].replace('600', '200').replace('400', '800/60');
              const iconBoxClass = grade.color.replace('text-', 'bg-').replace('600', '50').replace('400', '900/40') + " text-" + grade.color.split('text-')[1].split(' ')[0] + " border-" + grade.color.split('text-')[1].split(' ')[0].replace('600', '100').replace('400', '800/60');

              return (
                <button
                  key={item.submissionId}
                  onClick={() => setSelectedSubmissionId(item.submissionId)}
                  className={`${CARD_HOVER} w-full p-5 flex items-center gap-5 cursor-pointer text-left group bg-white dark:bg-slate-900`}
                >
                  {/* Score badge */}
                  <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center shrink-0 border ${iconBoxClass} shadow-sm group-hover:scale-105 transition-transform`}>
                    <span className="text-xl font-black tracking-tight">
                      {item.totalScore}
                    </span>
                    <span className="text-[10px] font-bold opacity-75">/10</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="font-bold text-slate-800 dark:text-slate-100 truncate tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-base">
                      {item.examTitle}
                    </p>
                    <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 truncate uppercase tracking-wider">
                      {item.className}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium pt-1">
                      <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/60 px-2.5 py-1 rounded-md border border-slate-200/60 dark:border-slate-700">
                        <Clock className="w-3 h-3" />
                        {formatDuration(item.timeSpentSeconds)}
                      </span>
                      <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/60 px-2.5 py-1 rounded-md border border-slate-200/60 dark:border-slate-700">
                        <Calendar className="w-3 h-3" />
                        {formatDate(item.submittedAt)}
                      </span>
                    </div>
                  </div>

                  {/* Grade tag + arrow */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`hidden sm:inline-flex text-[11px] font-bold px-3 py-1 rounded-full border ${badgeClass} shadow-sm`}>
                      {grade.label}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 group-hover:bg-indigo-50 group-hover:border-indigo-200 dark:group-hover:bg-indigo-900/40 dark:group-hover:border-indigo-800/60 transition-colors">
                       <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-all" />
                    </div>
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
