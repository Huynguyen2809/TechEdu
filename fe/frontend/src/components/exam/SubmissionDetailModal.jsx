import React, { useState, useEffect } from "react";
import { FileText, CheckCircle2, XCircle, AlertCircle, Maximize2, Minimize2, Sparkles, AlertTriangle, Lock, X, Calendar, Clock, Award } from "lucide-react";
import PDFViewer from "./PDFViewer";
import gradebookService from "../../services/gradebookService";
import submissionService from "../../services/submissionService";
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

function scoreGrade(score) {
  const num = Number(score);
  if (isNaN(num)) return { label: "Chưa có", color: "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700" };
  if (num >= 9) return { label: "Xuất sắc", color: "bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" };
  if (num >= 8) return { label: "Giỏi", color: "bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800" };
  if (num >= 6.5) return { label: "Khá", color: "bg-violet-50 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800" };
  if (num >= 5) return { label: "Trung bình", color: "bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800" };
  return { label: "Yếu", color: "bg-rose-50 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800" };
}

function PartBadge({ partType }) {
  const map = {
    PART_1_ABCD: { label: "Phần I", color: "bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800" },
    PART_2_TRUE_FALSE: { label: "Phần II", color: "bg-violet-50 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800" },
    PART_3_SHORT_ANSWER: { label: "Phần III", color: "bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800" },
  };
  const { label, color } = map[partType] || { label: partType, color: "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700" };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${color}`}>{label}</span>
  );
}

export default function SubmissionDetailModal({ submissionId, onClose, role = "STUDENT" }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterMode, setFilterMode] = useState("all"); // "all" | "incorrect"
  const [activePdfTab, setActivePdfTab] = useState("EXAM"); // "EXAM" | "EXPLANATION"

  useEffect(() => {
    if (!submissionId) return;
    const fetchDetail = async () => {
      setLoading(true);
      setError("");
      try {
        let data;
        if (role === "TEACHER" || role === "DEPARTMENT_HEAD") {
          data = await gradebookService.getSubmissionDetail(submissionId);
        } else {
          data = await submissionService.getMySubmissionDetail(submissionId);
        }
        setDetail(data);
      } catch (err) {
        setError(err.response?.data?.message || "Không thể lấy chi tiết bài thi.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [submissionId]);

  if (!submissionId) return null;

  const correctCount = detail?.details?.filter((d) => d.isCorrect).length ?? 0;
  const totalCount = detail?.details?.length ?? 0;
  const incorrectCount = totalCount - correctCount;
  const grade = scoreGrade(detail?.totalScore ?? 0);

  const displayedDetails = (detail?.details || []).filter((d) => {
    if (filterMode === "incorrect") return !d.isCorrect;
    return true;
  });

  const getRelativeQuestionNumber = (item) => {
    if (!detail?.details) return item.questionNumber;
    const samePartList = detail.details.filter((q) => q.partType === item.partType);
    const idx = samePartList.findIndex((q) => q === item || q.questionNumber === item.questionNumber);
    return idx !== -1 ? idx + 1 : item.questionNumber;
  };

  // Đường dẫn gốc trả về từ Backend (VD: /api/v1/files/123.pdf)
  const rawExamPdfUrl = detail?.examFileUrl;
  const rawExplanationPdfUrl = detail?.explanationFileUrl;
  const hasPdfSection = Boolean(rawExamPdfUrl || rawExplanationPdfUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className={`bg-white dark:bg-slate-900 cyber:bg-white rounded-3xl shadow-2xl cyber:shadow-[8px_8px_0_0_#0f172a] w-full h-[95vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 cyber:border-2 cyber:border-slate-900 relative transition-all ${hasPdfSection ? "max-w-7xl" : "max-w-3xl"}`}>
        {/* MODAL HEADER */}
        <div className="bg-indigo-600 dark:bg-slate-800 cyber:bg-indigo-600 text-white p-5 px-6 flex items-center justify-between shrink-0 border-b border-indigo-700 dark:border-slate-700 cyber:border-b-2 cyber:border-slate-900">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-white/15 text-white flex items-center justify-center shrink-0 border border-white/20">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-extrabold truncate" title={detail?.examTitle || "Chi tiết bài làm"}>
                {detail?.studentName ? `${detail.studentName} - ` : ""}{detail?.examTitle || "Chi Tiết Bài Làm"}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs text-indigo-100 dark:text-slate-400 truncate">
                  {detail?.className} {detail?.subjectName ? `· ${detail.subjectName}` : ""}
                </p>
                {detail?.warningCount > 0 && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-100 border border-rose-400/30">
                    <AlertTriangle className="w-3 h-3" />
                    Gian lận: {detail.warningCount} lần
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-hidden p-6 flex flex-col">
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-400 font-medium mt-3">Đang đối chiếu đáp án...</p>
            </div>
          ) : error ? (
            <div className="py-16 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
              <p className="text-sm font-bold text-slate-700">{error}</p>
            </div>
          ) : (
            <div className={hasPdfSection ? "grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 flex-1" : "flex-1 overflow-hidden flex flex-col"}>
              {/* KHUNG BÊN TRÁI: PDF VIEWER & TABS LỜI GIẢI */}
              {hasPdfSection && (
                <div className="lg:col-span-6 bg-slate-50 dark:bg-slate-800/40 cyber:bg-slate-50 rounded-2xl border border-slate-200 dark:border-slate-700 cyber:border-2 cyber:border-slate-900 p-4 flex flex-col gap-3 h-full min-h-0">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-3 flex-wrap">
                    <div className="flex bg-slate-200/80 dark:bg-slate-700/60 cyber:bg-slate-200 p-1 rounded-xl gap-1 cyber:border-2 cyber:border-slate-900">
                      <button
                        onClick={() => setActivePdfTab("EXAM")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                          activePdfTab === "EXAM"
                            ? "bg-white dark:bg-slate-900 cyber:bg-slate-900 text-blue-700 dark:text-blue-400 cyber:text-white shadow-sm cyber:border cyber:border-slate-900 cyber:shadow-[2px_2px_0_0_#0f172a]"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 cyber:bg-white cyber:text-slate-700 cyber:border cyber:border-slate-900 cyber:shadow-[2px_2px_0_0_#0f172a] cyber:hover:bg-slate-100"
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 cyber:text-white" />
                        <span>Đề thi</span>
                      </button>
                      <button
                        onClick={() => setActivePdfTab("EXPLANATION")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                          activePdfTab === "EXPLANATION"
                            ? "bg-violet-600 dark:bg-violet-700 cyber:bg-slate-900 text-white shadow-sm cyber:border cyber:border-slate-900 cyber:shadow-[2px_2px_0_0_#0f172a]"
                            : "text-slate-600 dark:text-slate-400 hover:text-violet-700 dark:hover:text-violet-300 cyber:bg-white cyber:text-slate-700 cyber:border cyber:border-slate-900 cyber:shadow-[2px_2px_0_0_#0f172a] cyber:hover:bg-slate-100"
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-violet-400 cyber:text-slate-400" />
                        <span>Lời giải chi tiết</span>
                      </button>
                    </div>

                    {activePdfTab === "EXPLANATION" && !detail.canViewExplanation && (
                      <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-1 rounded-md border border-amber-300 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-amber-600" />
                        <span>Đang khóa</span>
                      </span>
                    )}
                  </div>

                  {/* PDF embed content */}
                  <div className="flex-1 rounded-xl cyber:rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 cyber:border-2 cyber:border-slate-900 bg-white dark:bg-slate-900 cyber:bg-white flex flex-col justify-center items-center">
                    {activePdfTab === "EXAM" ? (
                      rawExamPdfUrl ? (
                        <div className="w-full h-full relative">
                          <PDFViewer pdfUrl={rawExamPdfUrl} />
                        </div>
                      ) : (
                        <div className="text-center p-6 text-slate-400">
                          <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
                          <p className="text-xs font-semibold">Tài liệu đề thi không khả dụng</p>
                        </div>
                      )
                    ) : (
                      detail.canViewExplanation ? (
                        rawExplanationPdfUrl ? (
                          <div className="w-full h-full relative">
                            <PDFViewer pdfUrl={rawExplanationPdfUrl} />
                          </div>
                        ) : (
                          <div className="text-center p-6 text-slate-400 max-w-sm">
                            <FileText className="w-10 h-10 mx-auto mb-2 text-violet-300" />
                            <p className="text-sm font-bold text-slate-700">Chưa đính kèm file Lời Giải</p>
                            <p className="text-xs text-slate-400 mt-1">
                              Giáo viên chưa tải lên tài liệu lời giải chi tiết cho đề thi này. Bạn vẫn có thể xem đáp án đúng ở bảng bên phải.
                            </p>
                          </div>
                        )
                      ) : (
                        <div className="text-center p-6 bg-amber-50/50 rounded-xl m-4 max-w-sm border border-amber-200">
                          <Lock className="w-10 h-10 mx-auto mb-2 text-amber-500" />
                          <p className="text-sm font-extrabold text-amber-900">Lời Giải Đang Được Bảo Mật</p>
                          <p className="text-xs text-amber-700 mt-1.5 leading-relaxed">
                            {detail.explanationPolicy === "NEVER"
                              ? "Giáo viên đã cấu hình không hiển thị lời giải chi tiết cho kỳ thi này."
                              : `Theo cấu hình của giáo viên, lời giải chi tiết và đáp án sẽ tự động mở sau khi kết thúc đợt thi${detail.endTime ? ` (lúc ${formatDate(detail.endTime)})` : ""}.`}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* KHUNG BÊN PHẢI: BẢNG ĐIỂM & ĐỐI CHIẾU ĐÁP ÁN */}
              <div className={hasPdfSection ? "lg:col-span-6 flex flex-col gap-6 min-h-0 h-full" : "flex-1 flex flex-col gap-6 min-h-0 h-full"}>
                {/* STATUS & SCORE SUMMARY CARD */}
                <div className="bg-slate-50 dark:bg-slate-800/60 cyber:bg-slate-50 rounded-2xl cyber:rounded-xl p-5 border border-slate-200/80 dark:border-slate-700 cyber:border-2 cyber:border-slate-900 cyber:shadow-[4px_4px_0_0_#0f172a] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1.5 text-center sm:text-left">
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${grade.color}`}>
                        {grade.label}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" /> {formatDate(detail.submittedAt)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2 justify-center sm:justify-start pt-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      Thời gian làm: <strong className="text-slate-900 dark:text-slate-100">{formatDuration(detail.timeSpentSeconds)}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-5 shrink-0 bg-white dark:bg-slate-900 cyber:bg-white px-5 py-3 rounded-xl cyber:border-2 cyber:border-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs cyber:shadow-[2px_2px_0_0_#0f172a]">
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Điểm số</p>
                      <p className="text-3xl font-black text-blue-600 dark:text-blue-400">
                        {detail.totalScore}<span className="text-xs text-slate-400 dark:text-slate-500 font-bold">/10</span>
                      </p>
                    </div>
                    <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Câu đúng</p>
                      <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                        {correctCount}<span className="text-xs text-slate-400 dark:text-slate-500 font-bold">/{totalCount}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* THÔNG BÁO KHÓA LỜI GIẢI NẾU CÓ */}
                {(!detail.canViewExplanation || detail?.showAnswers === false || detail?.showExplanation === false) && (
                  <div className="p-3.5 bg-amber-50 dark:bg-amber-950/80 border border-amber-200/80 dark:border-amber-800/80 rounded-2xl text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2.5 font-medium shadow-2xs">
                    <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>
                      🔒 <strong>Thông báo:</strong>{" "}
                      {detail.explanationPolicy === "NEVER"
                        ? "Giáo viên đã cấu hình không hiển thị lời giải và đáp án cho kỳ thi này."
                        : `Lời giải chi tiết và đáp án sẽ tự động mở sau khi kết thúc đợt thi${detail?.endTime ? ` (lúc ${formatDate(detail.endTime)})` : ""}.`}
                    </span>
                  </div>
                )}

                {/* BẢNG ĐỐI CHIẾU ĐÁP ÁN */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl cyber:rounded-xl border border-slate-200/80 dark:border-slate-800 cyber:border-2 cyber:border-slate-900 overflow-hidden shadow-xs cyber:shadow-[4px_4px_0_0_#0f172a] flex-1 flex flex-col min-h-0">
                  <div className="px-4 py-3 bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
                    <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider">
                      Đối chiếu chi tiết từng câu
                    </h3>

                    {/* Toggle filter */}
                    <div className="flex bg-slate-200/60 dark:bg-slate-800 cyber:bg-slate-200 p-1 rounded-xl gap-1 border border-slate-200 dark:border-slate-700 cyber:border-2 cyber:border-slate-900">
                      <button
                        onClick={() => setFilterMode("all")}
                        className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                          filterMode === "all"
                            ? "bg-white dark:bg-slate-900 cyber:bg-slate-900 text-slate-900 dark:text-slate-100 cyber:text-white shadow-xs cyber:border cyber:border-slate-900 cyber:shadow-[2px_2px_0_0_#0f172a]"
                            : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cyber:bg-white cyber:text-slate-700 cyber:border cyber:border-slate-900 cyber:shadow-[2px_2px_0_0_#0f172a] cyber:hover:bg-slate-100"
                        }`}
                      >
                        Tất cả ({totalCount})
                      </button>
                      {!detail.canViewExplanation ? null : (
                        <button
                          onClick={() => setFilterMode("incorrect")}
                          className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                            filterMode === "incorrect"
                              ? "bg-rose-600 dark:bg-rose-600 cyber:bg-slate-900 cyber:text-white text-white shadow-xs cyber:border cyber:border-slate-900 cyber:shadow-[2px_2px_0_0_#0f172a]"
                              : "text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 cyber:bg-white cyber:text-slate-700 cyber:border cyber:border-slate-900 cyber:shadow-[2px_2px_0_0_#0f172a] cyber:hover:bg-slate-100"
                          }`}
                        >
                          ❌ Chỉ câu làm sai ({incorrectCount})
                        </button>
                      )}
                    </div>
                  </div>

                  {displayedDetails.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 dark:text-slate-500 space-y-1">
                      <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">🎉 Tuyệt vời! Bạn không làm sai câu nào.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto flex-1 overflow-y-auto">
                      <table className="w-full text-xs">
                        <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-slate-800 cyber:bg-slate-200 shadow-2xs text-center border-b border-slate-200 dark:border-slate-700 cyber:border-b-2 cyber:border-slate-900">
                          <tr>
                            <th className="px-4 py-2.5 font-extrabold text-slate-600 dark:text-slate-300 uppercase">Câu</th>
                            <th className="px-4 py-2.5 font-extrabold text-slate-600 dark:text-slate-300 uppercase">Loại</th>
                            <th className="px-4 py-2.5 font-extrabold text-slate-600 dark:text-slate-300 uppercase">Em chọn</th>
                            <th className="px-4 py-2.5 font-extrabold text-slate-600 dark:text-slate-300 uppercase">Đáp án đúng</th>
                            <th className="px-4 py-2.5 font-extrabold text-slate-600 dark:text-slate-300 uppercase">Điểm</th>
                            <th className="px-4 py-2.5 font-extrabold text-slate-600 dark:text-slate-300 uppercase">Kết quả</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 cyber:divide-slate-900">
                          {displayedDetails.map((d) => {
                            const isRowHidden = !detail.canViewExplanation || d.correctAnswer === "🔒 Đã ẩn" || d.correctAnswer === "🔒" || d.rightAnswer === "🔒" || d.rightAnswer === "🔒 Đã ẩn";
                            return (
                            <tr
                              key={d.questionNumber}
                              className={`transition-colors ${isRowHidden ? "hover:bg-slate-50 dark:hover:bg-slate-800" : d.isCorrect ? "hover:bg-emerald-50 dark:hover:bg-emerald-950/20 cyber:hover:bg-emerald-50" : "hover:bg-rose-50 dark:hover:bg-rose-950/20 cyber:hover:bg-rose-50"}`}
                            >
                              <td className="px-4 py-3 font-bold text-slate-900 dark:text-slate-100 text-center whitespace-nowrap">{getRelativeQuestionNumber(d)}</td>
                              <td className="px-4 py-3 text-center">
                                <PartBadge partType={d.partType} />
                              </td>
                              <td className="px-4 py-3 font-mono font-bold text-slate-700 dark:text-slate-200 text-center">
                                {d.studentAnswer === "BO_TRONG" ? (
                                  <span className="text-slate-400 dark:text-slate-500 italic font-sans font-normal">Bỏ trống</span>
                                ) : (
                                  d.studentAnswer
                                )}
                              </td>
                              <td className="px-4 py-3 font-mono font-extrabold text-emerald-700 dark:text-emerald-400 text-center">
                                {isRowHidden ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700" title="Đang được bảo mật">
                                    <Lock className="w-3 h-3 text-slate-400 dark:text-slate-500" /> Đã ẩn
                                  </span>
                                ) : (
                                  d.correctAnswer || d.rightAnswer
                                )}
                              </td>
                              <td className="px-4 py-3 text-center font-mono font-bold">
                                {isRowHidden ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700" title="Đang được bảo mật">
                                    <Lock className="w-3 h-3 text-slate-400 dark:text-slate-500" /> Đã ẩn
                                  </span>
                                ) : (
                                  <>
                                    <span className={d.earnedPoints > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"}>
                                      +{d.earnedPoints}
                                    </span>
                                    <span className="text-slate-300 dark:text-slate-600">/{d.maxPoints}</span>
                                  </>
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {isRowHidden ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700" title="Đang được bảo mật">
                                    <Lock className="w-3 h-3 text-slate-400 dark:text-slate-500" /> Đã ẩn
                                  </span>
                                ) : d.isCorrect ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/80">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" /> Đúng
                                  </span>
                                ) : d.studentAnswer === "BO_TRONG" ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                    <AlertCircle className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" /> Bỏ trống
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400 border border-rose-200/80 dark:border-rose-800/80">
                                    <XCircle className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" /> Sai
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
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
