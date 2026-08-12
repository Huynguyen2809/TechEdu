import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import classService from "../../services/classService";
import {
  ArrowLeft,
  BookOpen,
  User,
  Clock,
  PlayCircle,
  Eye,
  AlertCircle,
  Calendar,
  Flame,
  BarChart3,
  CheckCircle2
} from "lucide-react";
import SubmissionDetailModal from "../../components/exam/SubmissionDetailModal";

// ── Shared Clean UI tokens ──────────────────────────────────────
const CARD = "bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm";
const BTN_PRIMARY = "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-semibold rounded-xl shadow-sm hover:shadow-md active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2";
const BTN_SECONDARY = "bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 font-semibold rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2";
const BADGE = "text-[11px] font-bold uppercase px-3 py-1 rounded-full border shadow-sm";

export default function StudentClassDetail() {
  const { classId } = useParams();
  const navigate = useNavigate();

  const [classInfo, setClassInfo] = useState(null);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);

  useEffect(() => {
    // Reset state lớp cũ ngay lập tức
    setClassInfo(null);
    setExams([]);

    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const [clsRes, examsRes] = await Promise.all([
          classService.getClassDetails(classId).catch(() => null),
          classService.getExamsForClass(classId)
        ]);

        if (clsRes) {
          setClassInfo(clsRes);
        }
        setExams(Array.isArray(examsRes) ? examsRes : []);
      } catch (err) {
        console.error("Lỗi tải chi tiết lớp học:", err);
        setError("Không thể tải thông tin lớp học hoặc danh sách bài thi.");
      } finally {
        setLoading(false);
      }
    };

    if (classId) {
      fetchData();
    }
  }, [classId]);

  const now = new Date();
  const pendingExams  = exams.filter(e => !e.hasSubmitted && new Date(e.endTime) > now);
  const expiredExams  = exams.filter(e => !e.hasSubmitted && new Date(e.endTime) <= now);
  const submittedExams = exams.filter(e => e.hasSubmitted);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Modal chi tiết bài làm */}
      {selectedSubmissionId && (
        <SubmissionDetailModal
          submissionId={selectedSubmissionId}
          onClose={() => setSelectedSubmissionId(null)}
        />
      )}

      {/* ── HEADER: Thông tin lớp (Glassmorphism & Gradient) ── */}
      <div className="relative rounded-3xl p-6 sm:p-8 text-white overflow-hidden shadow-lg border border-indigo-500/30">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 z-0"></div>
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none z-0"></div>
        <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-indigo-400/20 rounded-full blur-2xl pointer-events-none z-0"></div>

        <div className="relative z-10">
          <button
            onClick={() => navigate("/student/classes")}
            className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md px-4 py-2 rounded-xl text-sm font-semibold transition-all mb-4 inline-flex items-center gap-2 cursor-pointer border border-white/20"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Danh sách lớp</span>
          </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
                {classInfo?.name || `Lớp học #${classId}`}
              </h1>
              <div className="flex items-center gap-2">
                <span className="bg-white/10 backdrop-blur-md border border-white/20 text-[11px] font-bold px-3 py-1 rounded-full shadow-sm text-white">
                  Môn: {classInfo?.subjectName || "Bộ môn"}
                </span>
                {classInfo?.gradeLevel && (
                  <span className="bg-white/10 backdrop-blur-md border border-white/20 text-[11px] font-bold px-3 py-1 rounded-full shadow-sm text-white">
                    Khối {classInfo.gradeLevel}
                  </span>
                )}
              </div>
            </div>

            {/* Badge Giáo viên */}
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl text-sm font-semibold border border-white/20 shadow-sm text-white">
              <User className="w-4 h-4 text-indigo-200" />
              <span>Giáo viên: </span>
              <strong className="font-extrabold">{classInfo?.teacherName || "Giáo viên bộ môn"}</strong>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800/60 rounded-xl flex items-center gap-3 text-rose-600 dark:text-rose-400 text-sm font-medium">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 p-8">
           <div className="h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl w-full mb-6 animate-pulse"></div>
           <div className="space-y-4 animate-pulse">
             {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-slate-50 dark:bg-slate-800/50 rounded-xl w-full"></div>
             ))}
           </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm overflow-hidden">
          {/* ── Tabs header ── */}
          <div className="flex flex-wrap border-b border-slate-200/60 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-800/40 px-6 pt-4 gap-2">
            <button
              onClick={() => setActiveTab("pending")}
              className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm rounded-t-2xl transition-all cursor-pointer border-2 border-b-0 ${
                activeTab === "pending"
                  ? "border-slate-200/60 dark:border-slate-700/60 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900"
                  : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50"
              }`}
            >
              <Flame className={`w-4 h-4 ${activeTab === "pending" ? "text-orange-500" : "text-slate-400"}`} />
              <span>Bài kiểm tra cần làm</span>
              <span className={`ml-1 px-2 py-0.5 text-[11px] rounded-full font-bold ${
                activeTab === "pending"
                  ? "bg-orange-50 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800/60"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
              }`}>
                {pendingExams.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("results")}
              className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm rounded-t-2xl transition-all cursor-pointer border-2 border-b-0 ${
                activeTab === "results"
                  ? "border-slate-200/60 dark:border-slate-700/60 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900"
                  : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50"
              }`}
            >
              <BarChart3 className={`w-4 h-4 ${activeTab === "results" ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`} />
              <span>Kết quả & Bảng điểm</span>
              <span className={`ml-1 px-2 py-0.5 text-[11px] rounded-full font-bold ${
                activeTab === "results"
                  ? "bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
              }`}>
                {submittedExams.length}
              </span>
            </button>

            {/* Tab Quá hạn (BUG-07) */}
            {expiredExams.length > 0 && (
              <button
                onClick={() => setActiveTab("expired")}
                className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm rounded-t-2xl transition-all cursor-pointer border-2 border-b-0 ${
                  activeTab === "expired"
                    ? "border-slate-200/60 dark:border-slate-700/60 text-rose-600 dark:text-rose-400 bg-white dark:bg-slate-900"
                    : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                }`}
              >
                <AlertCircle className={`w-4 h-4 ${activeTab === "expired" ? "text-rose-500" : "text-slate-400"}`} />
                <span>Quá hạn chưa nộp</span>
                <span className={`ml-1 px-2 py-0.5 text-[11px] rounded-full font-bold ${
                  activeTab === "expired"
                    ? "bg-rose-50 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                }`}>
                  {expiredExams.length}
                </span>
              </button>
            )}
          </div>

          {/* ── Tab 1: Bài kiểm tra cần làm ── */}
          {activeTab === "pending" && (
            <div className="p-6">
              {pendingExams.length === 0 ? (
                <div className="text-center py-16 space-y-4 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                  <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/40 rounded-full flex items-center justify-center mx-auto text-emerald-500 border border-emerald-100 dark:border-emerald-800/60 shadow-sm">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                     <p className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">Tuyệt vời! Bạn không có bài tập nào.</p>
                     <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Hãy theo dõi lớp học thường xuyên để cập nhật đề thi mới.</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[650px]">
                    <thead>
                      <tr className="bg-slate-50/80 dark:bg-slate-800/60 text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200/60 dark:border-slate-800/60">
                        <th className="py-4 px-5">Tên bài kiểm tra</th>
                        <th className="py-4 px-5 text-center">Thời gian làm bài</th>
                        <th className="py-4 px-5 text-center">Thời gian mở - đóng</th>
                        <th className="py-4 px-5 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm text-slate-700 dark:text-slate-200 font-medium">
                      {pendingExams.map((exam) => {
                        const now2 = new Date();
                        const start = new Date(exam.startTime);
                        const end = new Date(exam.endTime);
                        const isOpen = now2 >= start && now2 <= end;

                        return (
                          <tr key={exam.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="py-5 px-5 font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                              {exam.title}
                            </td>
                            <td className="py-5 px-5 text-center text-xs">
                              <span className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-200 shadow-sm">
                                <Clock className="w-4 h-4 text-slate-400" />
                                {exam.durationMinutes} phút
                              </span>
                            </td>
                            <td className="py-5 px-5 text-center text-xs text-slate-500 dark:text-slate-400">
                              <div className="font-semibold text-slate-700 dark:text-slate-300">{formatDate(exam.startTime)}</div>
                              <div className="text-[11px] mt-0.5">đến {formatDate(exam.endTime)}</div>
                            </td>
                            <td className="py-5 px-5 text-right">
                              {isOpen ? (
                                <button
                                  onClick={() => navigate(`/student/exam/${exam.id}`)}
                                  className={`${BTN_PRIMARY} inline-flex items-center gap-2 px-5 py-2 text-xs`}
                                >
                                  <PlayCircle className="w-4 h-4 text-white" />
                                  <span>Vào Thi Ngay</span>
                                </button>
                              ) : now < start ? (
                                <span className="text-[11px] text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/40 px-3 py-1.5 rounded-lg font-bold border border-orange-200 dark:border-orange-800/60">
                                  Chưa đến giờ thi
                                </span>
                              ) : (
                                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium italic">
                                  Hết thời gian
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── Tab 2: Kết quả & Bảng điểm ── */}
          {activeTab === "results" && (
            <div className="p-6">
              {submittedExams.length === 0 ? (
                <div className="text-center py-16 space-y-4 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <BarChart3 className="w-8 h-8" />
                  </div>
                  <p className="text-base font-bold text-slate-700 dark:text-slate-300">Chưa có kết quả làm bài nào trong lớp này.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[650px]">
                    <thead>
                      <tr className="bg-slate-50/80 dark:bg-slate-800/60 text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200/60 dark:border-slate-800/60">
                        <th className="py-4 px-5">Tên bài thi</th>
                        <th className="py-4 px-5 text-center">Ngày nộp</th>
                        <th className="py-4 px-5 text-center">Điểm số chuẩn</th>
                        <th className="py-4 px-5 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm font-medium text-slate-700 dark:text-slate-200">
                      {submittedExams.map((exam) => {
                        const scoreVal = exam.score ?? exam.finalScore ?? exam.totalScore ?? exam.submission?.score;
                        const hasScore = scoreVal !== undefined && scoreVal !== null;
                        const isExpiredUnsubmitted = !exam.hasSubmitted;

                        return (
                          <tr key={exam.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="py-5 px-5 font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                              {exam.title}
                            </td>
                            <td className="py-5 px-5 text-center text-xs text-slate-500 dark:text-slate-400">
                              {isExpiredUnsubmitted ? (
                                <span className="italic">Không nộp / Quá hạn</span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 font-medium">
                                  <Calendar className="w-4 h-4 text-slate-400" />
                                  {formatDate(exam.submittedAt || exam.submission?.submittedAt)}
                                </span>
                              )}
                            </td>
                            <td className="py-5 px-5 text-center">
                              {isExpiredUnsubmitted ? (
                                <span className="text-slate-400 font-bold">-</span>
                              ) : hasScore ? (
                                <span>
                                  <span className={`font-black text-lg tracking-tight ${
                                    scoreVal >= 8.0
                                      ? "text-emerald-600 dark:text-emerald-400"
                                      : scoreVal >= 5.0
                                      ? "text-indigo-600 dark:text-indigo-400"
                                      : "text-rose-600 dark:text-rose-400"
                                  }`}>{scoreVal}</span>
                                  <span className="text-slate-400 dark:text-slate-500 font-bold text-xs"> / 10</span>
                                </span>
                              ) : (
                                <span className="text-slate-400 dark:text-slate-500 italic text-xs">
                                  Chờ công bố
                                </span>
                              )}
                            </td>
                            <td className="py-5 px-5 text-right">
                              {isExpiredUnsubmitted ? (
                                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">Quá hạn / Hết giờ</span>
                              ) : (
                                <button
                                  onClick={() => setSelectedSubmissionId(exam.submission?.id || exam.id)}
                                  className={`${BTN_SECONDARY} px-4 py-2 text-xs w-auto inline-flex`}
                                >
                                  <Eye className="w-4 h-4" />
                                  <span>Xem chi tiết</span>
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── Tab 3: Quá hạn chưa nộp (BUG-07) ── */}
          {activeTab === "expired" && (
            <div className="p-6">
              {expiredExams.length === 0 ? (
                <div className="text-center py-16 space-y-4 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                  <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/40 rounded-full flex items-center justify-center mx-auto text-emerald-500 border border-emerald-100 dark:border-emerald-800/60 shadow-sm">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <p className="text-base font-bold text-slate-800 dark:text-slate-100">Không có bài thi nào bị quá hạn.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {expiredExams.map(exam => (
                    <div key={exam.id} className="flex items-center justify-between p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl shadow-sm">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100 text-base tracking-tight">{exam.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5"/> Hết hạn: {formatDate(exam.endTime)}</p>
                      </div>
                      <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/40 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-800/60">
                        Quá hạn không nộp
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
