import React, { useState, useEffect, useMemo, useCallback } from "react";
import classService from "../../services/classService";
import gradebookService from "../../services/gradebookService";
import {
  BarChart2,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  X
} from "lucide-react";

import GradebookSidebar from "../../components/teacher/gradebook/GradebookSidebar";
import GradebookStats from "../../components/teacher/gradebook/GradebookStats";
import GradebookTable from "../../components/teacher/gradebook/GradebookTable";
import SubmissionDetailModal from "../../components/teacher/gradebook/modals/SubmissionDetailModal";

export default function Gradebook() {
  const [selectedExamId, setSelectedExamId] = useState(null);
  const [selectedExamTitle, setSelectedExamTitle] = useState("");
  const [gradebook, setGradebook] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingExams, setLoadingExams] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [error, setError] = useState("");

  // Toast Notification
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', text: '' }

  const showToast = useCallback((text, type = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Flat list của tất cả exam từ tất cả lớp
  const [allExams, setAllExams] = useState([]);

  // Load gradebook khi chọn exam
  const loadGradebook = useCallback(async (examId, examTitle) => {
    setSelectedExamId(examId);
    setSelectedExamTitle(examTitle);
    setLoading(true);
    setGradebook(null);
    setError("");
    try {
      const data = await gradebookService.getExamGradebook(examId);
      setGradebook(data);
    } catch (err) {
      setError(err.response?.data?.message || "Không tải được bảng điểm.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load danh sách lớp + exam khi mount (An toàn với isMounted)
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const myClasses = await classService.getMyClasses();
        if (!mounted) return;

        // Load exam của từng lớp song song
        const examPromises = (myClasses || []).map((cls) =>
          classService
            .getExamsForClass(cls.id)
            .then((exams) =>
              (exams || []).map((e) => ({
                ...e,
                classId: cls.id,
                className: cls.name,
                subjectName: cls.subjectName
              }))
            )
            .catch(() => [])
        );
        const examArrays = await Promise.all(examPromises);
        if (!mounted) return;

        const flatExams = examArrays.flat();
        setAllExams(flatExams);

        // Tự động chọn exam đầu tiên nếu có
        if (flatExams.length > 0) {
          loadGradebook(flatExams[0].id, flatExams[0].title);
        }
      } catch {
        if (mounted) setError("Không thể tải danh sách lớp học.");
      } finally {
        if (mounted) setLoadingExams(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [loadGradebook]);

  // Xuất Excel
  const handleExportExcel = useCallback(async () => {
    if (!selectedExamId) return;
    setExporting(true);
    try {
      const blob = await gradebookService.exportGradebookToExcel(selectedExamId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Bang_Diem_${selectedExamTitle.replace(/\s+/g, "_")}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
      showToast("Xuất bảng điểm Excel thành công!");
    } catch {
      showToast("Xuất Excel thất bại. Vui lòng thử lại.", "error");
    } finally {
      setExporting(false);
    }
  }, [selectedExamId, selectedExamTitle, showToast]);

  // ── Tính toán các chỉ số thống kê (Memorized) ──
  const stats = useMemo(() => {
    if (!gradebook) return null;
    const scores = gradebook.scores || [];
    return {
      total: gradebook.totalSubmissions || 0,
      avg: gradebook.statistics?.averageScore || 0,
      max: gradebook.statistics?.maxScore || 0,
      min: gradebook.statistics?.minScore || 0,
      passRate: scores.length
        ? Math.round(
            (scores.filter((s) => s.totalScore >= 5).length / scores.length) *
              100
          )
        : 0
    };
  }, [gradebook]);

  return (
    <div className="space-y-6">
      {/* Toast Notification Banner */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 animate-in slide-in-from-top-3 duration-200 ${
            toast.type === "error"
              ? "bg-rose-50 dark:bg-rose-950 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-800"
              : "bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800"
          }`}
        >
          {toast.type === "error" ? (
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          )}
          <span className="text-xs font-bold">{toast.text}</span>
          <button
            onClick={() => setToast(null)}
            className="p-1 hover:bg-black/5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
          <BarChart2 className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
          <span>Sổ điểm &amp; Báo cáo kết quả</span>
        </h1>

        {/* NÚT XUẤT EXCEL */}
        {selectedExamId && (
          <button
            id="btn-export-excel"
            onClick={handleExportExcel}
            disabled={exporting || !gradebook}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl px-4 py-2.5 shadow-sm flex items-center gap-2 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed text-xs sm:text-sm shrink-0 cyber:bg-emerald-600 cyber:border-2 cyber:border-slate-900 cyber:shadow-[3px_3px_0_0_#0f172a]"
          >
            {exporting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <FileSpreadsheet className="w-4 h-4" />
            )}
            <span>Xuất Excel (.xlsx)</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* ── SIDEBAR: CHỌN ĐỀ THI ── */}
        <div className="lg:col-span-1">
          <GradebookSidebar
            allExams={allExams}
            loadingExams={loadingExams}
            selectedExamId={selectedExamId}
            onSelectExam={loadGradebook}
          />
        </div>

        {/* ── MAIN: BẢNG ĐIỂM & THỐNG KÊ ── */}
        <div className="lg:col-span-3 space-y-6">
          {/* Placeholder khi chưa chọn */}
          {!selectedExamId && !loading && (
            <div className="bg-white dark:bg-slate-900 cyber:bg-white rounded-3xl border border-slate-200/80 dark:border-slate-800 cyber:border-2 cyber:border-slate-900 shadow-sm dark:shadow-none cyber:shadow-[3px_3px_0_0_#0f172a] flex flex-col items-center justify-center py-24 gap-4 text-center">
              <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-3xl flex items-center justify-center border border-indigo-100 dark:border-indigo-900/60">
                <BarChart2 className="w-8 h-8" />
              </div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Vui lòng chọn một bài thi ở cột bên trái để tải dữ liệu điểm số
              </p>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="bg-white dark:bg-slate-900 cyber:bg-white rounded-3xl border border-slate-200/80 dark:border-slate-800 cyber:border-2 cyber:border-slate-900 shadow-sm dark:shadow-none cyber:shadow-[3px_3px_0_0_#0f172a] flex items-center justify-center py-24">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-xs text-slate-400 font-medium">
                  Đang tổng hợp dữ liệu bảng điểm...
                </p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
              <p className="text-xs sm:text-sm text-rose-700 dark:text-rose-300 font-medium">
                {error}
              </p>
            </div>
          )}

          {/* Nội dung bảng điểm */}
          {gradebook && stats && (
            <>
              {/* Tiêu đề exam đang xem */}
              <div className="bg-white dark:bg-slate-900 cyber:bg-white rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 cyber:border-2 cyber:border-slate-900 shadow-xs dark:shadow-none cyber:shadow-[3px_3px_0_0_#0f172a] flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">
                    {gradebook.examTitle}
                  </h2>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold mt-0.5">
                    Lớp: {gradebook.className}
                  </p>
                </div>
                <span className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-xl text-xs font-black border border-indigo-200/60 dark:border-indigo-900">
                  {stats.total} bài nộp
                </span>
              </div>

              {/* STAT CARDS */}
              <GradebookStats stats={stats} />

              {/* BẢNG DỮ LIỆU ĐIỂM SỐ */}
              <GradebookTable
                scores={gradebook.scores || []}
                passRate={stats.passRate}
                totalSubmissions={stats.total}
                onSelectSubmission={setSelectedSubmission}
              />
            </>
          )}
        </div>
      </div>

      {/* Modal chi tiết bài làm */}
      {selectedSubmission && (
        <SubmissionDetailModal
          submissionId={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
        />
      )}
    </div>
  );
}
