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

// ── Shared tri-theme tokens ──────────────────────────────────────
const CARD = "bg-white dark:bg-slate-900 cyber:bg-white rounded-2xl border border-slate-200/80 dark:border-slate-800 cyber:border-2 cyber:border-slate-900 shadow-sm dark:shadow-none cyber:shadow-[4px_4px_0_0_#0f172a]";
const BTN_PRIMARY = "bg-indigo-600 dark:bg-indigo-500 cyber:bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-400 cyber:hover:bg-indigo-500 text-white font-semibold rounded-xl border border-transparent cyber:border-2 cyber:border-slate-900 shadow-sm cyber:shadow-[2px_2px_0_0_#0f172a] cyber:active:translate-x-0.5 cyber:active:translate-y-0.5 cyber:active:shadow-none transition-all cursor-pointer";
const BTN_SECONDARY = "bg-white dark:bg-slate-800 cyber:bg-white hover:bg-slate-50 dark:hover:bg-slate-700 cyber:hover:bg-slate-100 text-slate-700 dark:text-slate-200 cyber:text-slate-900 font-semibold rounded-xl border border-slate-200 dark:border-slate-700 cyber:border-2 cyber:border-slate-900 shadow-sm cyber:shadow-[2px_2px_0_0_#0f172a] cyber:active:translate-x-0.5 cyber:active:translate-y-0.5 cyber:active:shadow-none transition-all cursor-pointer";
const BADGE = "text-xs font-semibold uppercase px-3 py-1 rounded-lg border cyber:border-2 cyber:border-slate-900 cyber:shadow-[2px_2px_0_0_#0f172a]";

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
  // BUG-07: Tách thành 3 trạng thái rõ ràng
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

      {/* ── HEADER: Thông tin lớp ── */}
      <div className={`${CARD} rounded-3xl p-6 sm:p-8 space-y-4`}>
        <div>
          <button
            onClick={() => navigate("/student/classes")}
            className={`${BTN_SECONDARY} inline-flex items-center gap-2 px-4 py-2 text-sm mb-4`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại danh sách lớp</span>
          </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                {classInfo?.name || `Lớp học #${classId}`}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <span className={`${BADGE} bg-sky-50 dark:bg-blue-950/60 cyber:bg-sky-300 text-sky-700 dark:text-blue-300 cyber:text-slate-900 border-sky-200 dark:border-blue-900/60`}>
                  Môn: {classInfo?.subjectName || "Bộ môn"}
                </span>
                {classInfo?.gradeLevel && (
                  <span className={`${BADGE} bg-slate-100 dark:bg-slate-800 cyber:bg-slate-200 text-slate-600 dark:text-slate-300 cyber:text-slate-900 border-slate-200 dark:border-slate-700`}>
                    Khối {classInfo.gradeLevel}
                  </span>
                )}
              </div>
            </div>

            {/* Badge Giáo viên */}
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 cyber:bg-slate-50 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 cyber:text-slate-900 border border-slate-200 dark:border-slate-700 cyber:border-2 cyber:border-slate-900 shadow-sm cyber:shadow-[2px_2px_0_0_#0f172a]">
              <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Giáo viên: </span>
              <strong className="text-slate-900 dark:text-slate-100 font-bold">{classInfo?.teacherName || "Giáo viên bộ môn"}</strong>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800/60 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className={`${CARD} rounded-3xl py-20 text-center space-y-3`}>
          <div className="w-10 h-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Đang tải thông tin lớp học...</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 cyber:bg-white rounded-3xl border border-slate-200/80 dark:border-slate-800 cyber:border-2 cyber:border-slate-900 shadow-sm dark:shadow-none cyber:shadow-[4px_4px_0_0_#0f172a] overflow-hidden">
          {/* ── Tabs header ── */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 cyber:border-b-2 cyber:border-slate-900 bg-slate-50 dark:bg-slate-800/40 cyber:bg-slate-50 px-6 pt-4 gap-2">
            <button
              onClick={() => setActiveTab("pending")}
              className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm rounded-t-2xl transition-all cursor-pointer border-2 border-b-0 ${
                activeTab === "pending"
                  ? "border-slate-200 dark:border-slate-700 cyber:border-slate-900 text-indigo-600 dark:text-indigo-400 cyber:text-slate-900 bg-white dark:bg-slate-900 cyber:bg-white shadow-sm cyber:shadow-[2px_-2px_0_0_#0f172a] dark:shadow-none"
                  : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50"
              }`}
            >
              <Flame className={`w-4 h-4 ${activeTab === "pending" ? "text-amber-500" : "text-slate-400 dark:text-slate-500"}`} />
              <span>Bài kiểm tra cần làm</span>
              <span className={`ml-1 px-2 py-0.5 text-xs rounded-full font-semibold ${
                activeTab === "pending"
                  ? "bg-amber-100 dark:bg-amber-950/80 cyber:bg-amber-300 text-amber-700 dark:text-amber-400 cyber:text-slate-900 border border-amber-200 dark:border-amber-800/80 cyber:border-2 cyber:border-slate-900"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
              }`}>
                {pendingExams.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("results")}
              className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm rounded-t-2xl transition-all cursor-pointer border-2 border-b-0 ${
                activeTab === "results"
                  ? "border-slate-200 dark:border-slate-700 cyber:border-slate-900 text-indigo-600 dark:text-indigo-400 cyber:text-slate-900 bg-white dark:bg-slate-900 cyber:bg-white shadow-sm cyber:shadow-[2px_-2px_0_0_#0f172a] dark:shadow-none"
                  : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50"
              }`}
            >
              <BarChart3 className={`w-4 h-4 ${activeTab === "results" ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500"}`} />
              <span>Kết quả & Bảng điểm</span>
              <span className={`ml-1 px-2 py-0.5 text-xs rounded-full font-semibold ${
                activeTab === "results"
                  ? "bg-indigo-100 dark:bg-indigo-950/80 cyber:bg-sky-300 text-indigo-700 dark:text-indigo-300 cyber:text-slate-900 border border-indigo-200 dark:border-indigo-900/80 cyber:border-2 cyber:border-slate-900"
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
                    ? "border-slate-200 dark:border-slate-700 cyber:border-slate-900 text-rose-600 dark:text-rose-400 cyber:text-slate-900 bg-white dark:bg-slate-900 cyber:bg-white shadow-sm cyber:shadow-[2px_-2px_0_0_#0f172a] dark:shadow-none"
                    : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                }`}
              >
                <AlertCircle className={`w-4 h-4 ${activeTab === "expired" ? "text-rose-500" : "text-slate-400 dark:text-slate-500"}`} />
                <span>Quá hạn chưa nộp</span>
                <span className={`ml-1 px-2 py-0.5 text-xs rounded-full font-semibold ${
                  activeTab === "expired"
                    ? "bg-rose-100 dark:bg-rose-950/80 cyber:bg-rose-300 text-rose-700 dark:text-rose-300 cyber:text-slate-900 border border-rose-200 dark:border-rose-900/80 cyber:border-2 cyber:border-slate-900"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                }`}>
                  {expiredExams.length}
                </span>
              </button>
            )}
          </div>

          {/* ── Tab 1: Bài kiểm tra cần làm ── */}
          {activeTab === "pending" && (
            <div className="p-6 sm:p-8">
              {pendingExams.length === 0 ? (
                <div className="text-center py-12 space-y-3 bg-slate-50 dark:bg-slate-800/40 cyber:bg-slate-50 rounded-2xl border border-slate-100 dark:border-slate-800 cyber:border-2 cyber:border-slate-900 cyber:shadow-[2px_2px_0_0_#0f172a]">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 dark:text-emerald-400 mx-auto" />
                  <p className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">Tuyệt vời! Bạn không có bài kiểm tra nào cần làm.</p>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Hãy theo dõi lớp học thường xuyên để cập nhật đề thi mới.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[650px]">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/80 cyber:bg-slate-100 text-[11px] font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 cyber:border-b-2 cyber:border-slate-900">
                        <th className="py-3 px-4">Tên bài kiểm tra</th>
                        <th className="py-3 px-4 text-center">Thời gian làm bài</th>
                        <th className="py-3 px-4 text-center">Thời gian mở - đóng</th>
                        <th className="py-3 px-4 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 cyber:divide-slate-200 text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {pendingExams.map((exam) => {
                        const now2 = new Date();
                        const start = new Date(exam.startTime);
                        const end = new Date(exam.endTime);
                        const isOpen = now2 >= start && now2 <= end;

                        return (
                          <tr key={exam.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 cyber:hover:bg-slate-50 transition-colors">
                            <td className="py-4 px-4 font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                              {exam.title}
                            </td>
                            <td className="py-4 px-4 text-center text-slate-600 dark:text-slate-300 text-xs">
                              <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 cyber:bg-slate-200 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 cyber:border-2 cyber:border-slate-900 font-semibold text-slate-700 dark:text-slate-200 cyber:text-slate-900">
                                <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                                {exam.durationMinutes} phút
                              </span>
                            </td>
                            <td className="py-4 px-4 text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
                              <div>{formatDate(exam.startTime)}</div>
                              <div className="text-[11px] text-slate-400 dark:text-slate-500">đến {formatDate(exam.endTime)}</div>
                            </td>
                            <td className="py-4 px-4 text-right">
                              {isOpen ? (
                                <button
                                  onClick={() => navigate(`/student/exam/${exam.id}`)}
                                  className={`${BTN_PRIMARY} inline-flex items-center gap-1.5 px-4 py-2 text-xs`}
                                >
                                  <PlayCircle className="w-4 h-4 text-amber-300" />
                                  <span>Vào Thi Ngay</span>
                                </button>
                              ) : now < start ? (
                                <span className="text-xs text-amber-700 dark:text-amber-300 cyber:text-slate-900 bg-amber-50 dark:bg-amber-950/80 cyber:bg-amber-300 px-3 py-1 rounded-lg font-semibold border border-amber-200 dark:border-amber-800/80 cyber:border-2 cyber:border-slate-900">
                                  Chưa đến giờ thi
                                </span>
                              ) : (
                                <span className="text-xs text-slate-400 dark:text-slate-500 italic">
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
            <div className="p-6 sm:p-8">
              {submittedExams.length === 0 ? (
                <div className="text-center py-12 space-y-3 bg-slate-50 dark:bg-slate-800/40 cyber:bg-slate-50 rounded-2xl border border-slate-100 dark:border-slate-800 cyber:border-2 cyber:border-slate-900 cyber:shadow-[2px_2px_0_0_#0f172a]">
                  <BarChart3 className="w-10 h-10 text-slate-400 dark:text-slate-500 mx-auto" />
                  <p className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">Chưa có kết quả làm bài nào trong lớp này.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[650px]">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/80 cyber:bg-slate-100 text-[11px] font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 cyber:border-b-2 cyber:border-slate-900">
                        <th className="py-3 px-4">Tên bài thi</th>
                        <th className="py-3 px-4 text-center">Ngày nộp</th>
                        <th className="py-3 px-4 text-center">Điểm số chuẩn</th>
                        <th className="py-3 px-4 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 cyber:divide-slate-200 text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {submittedExams.map((exam) => {
                        const scoreVal = exam.score ?? exam.finalScore ?? exam.totalScore ?? exam.submission?.score;
                        const hasScore = scoreVal !== undefined && scoreVal !== null;
                        const isExpiredUnsubmitted = !exam.hasSubmitted;

                        return (
                          <tr key={exam.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 cyber:hover:bg-slate-50 transition-colors">
                            <td className="py-4 px-4 font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                              {exam.title}
                            </td>
                            <td className="py-4 px-4 text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
                              {isExpiredUnsubmitted ? (
                                <span className="text-slate-400 dark:text-slate-500 italic">Không nộp / Quá hạn</span>
                              ) : (
                                <span className="inline-flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                                  {formatDate(exam.submittedAt || exam.submission?.submittedAt)}
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-4 text-center">
                              {isExpiredUnsubmitted ? (
                                <span className="text-slate-400 dark:text-slate-500 font-bold">-</span>
                              ) : hasScore ? (
                                <span>
                                  <span className={`font-black text-base tracking-tight ${
                                    scoreVal >= 8.0
                                      ? "text-emerald-600 dark:text-emerald-400"
                                      : scoreVal >= 5.0
                                      ? "text-blue-600 dark:text-blue-400"
                                      : "text-rose-600 dark:text-rose-400"
                                  }`}>{scoreVal}</span>
                                  <span className="text-slate-400 dark:text-slate-500 font-bold"> / 10</span>
                                </span>
                              ) : (
                                <span className="text-slate-400 dark:text-slate-500 italic font-medium">
                                  Chờ công bố
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-4 text-right">
                              {isExpiredUnsubmitted ? (
                                <span className="text-slate-600 dark:text-slate-300 cyber:text-slate-900 font-semibold text-xs bg-slate-100 dark:bg-slate-800 cyber:bg-slate-200 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 cyber:border-2 cyber:border-slate-900">Quá hạn / Hết giờ</span>
                              ) : (
                                <button
                                  onClick={() => setSelectedSubmissionId(exam.submission?.id || exam.id)}
                                  className="bg-amber-50 dark:bg-amber-950/80 cyber:bg-amber-100 hover:bg-amber-100 dark:hover:bg-amber-900/80 cyber:hover:bg-amber-200 text-amber-700 dark:text-amber-300 cyber:text-slate-900 font-semibold border border-amber-200 dark:border-amber-700/80 cyber:border-2 cyber:border-slate-900 px-4 py-2 rounded-lg cyber:shadow-[2px_2px_0_0_#0f172a] cyber:active:translate-x-0.5 cyber:active:translate-y-0.5 cyber:active:shadow-none transition-all inline-flex items-center gap-2 text-xs cursor-pointer"
                                >
                                  <Eye className="w-4 h-4" />
                                  <span>Xem bài làm</span>
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
            <div className="p-6 sm:p-8">
              {expiredExams.length === 0 ? (
                <div className="text-center py-12 space-y-3 bg-slate-50 dark:bg-slate-800/40 cyber:bg-slate-50 rounded-2xl border border-slate-100 dark:border-slate-800 cyber:border-2 cyber:border-slate-900">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 dark:text-emerald-400 mx-auto" />
                  <p className="text-base font-bold text-slate-800 dark:text-slate-100">Không có bài thi nào bị quá hạn.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {expiredExams.map(exam => (
                    <div key={exam.id} className="flex items-center justify-between p-4 bg-rose-50 dark:bg-rose-950/30 cyber:bg-rose-50 border border-rose-200 dark:border-rose-900/60 cyber:border-2 cyber:border-slate-900 rounded-2xl">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">{exam.title}</p>
                        <p className="text-xs text-rose-600 dark:text-rose-400 mt-0.5">Hết hạn: {formatDate(exam.endTime)}</p>
                      </div>
                      <span className="text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950/80 cyber:bg-rose-200 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-800 cyber:border-2 cyber:border-slate-900">
                        Quá hạn
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
