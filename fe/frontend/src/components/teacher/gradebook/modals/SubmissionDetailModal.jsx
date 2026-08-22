import React, { useState, useEffect } from "react";
import { Eye, X } from "lucide-react";
import gradebookService from "../../../../services/gradebookService";

function formatTime(seconds) {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m} phút ${s} giây`;
}

function formatDate(isoString) {
  if (!isoString) return "—";
  return new Date(isoString).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function getScoreBadgeStyle(score) {
  const s = Number(score) || 0;
  if (s >= 8.0) {
    return "text-emerald-600 bg-emerald-50 border-emerald-200 font-black";
  }
  if (s >= 5.0) {
    return "text-emerald-600 bg-emerald-50 border-emerald-200 font-black";
  }
  return "text-amber-600 bg-amber-50 border-amber-200 font-black";
}

export default function SubmissionDetailModal({ submissionId, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await gradebookService.getSubmissionDetail(submissionId);
        if (mounted) setDetail(data);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [submissionId]);

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col border border-slate-100 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
              <Eye className="w-4 h-4" />
            </div>
            <h2 className="font-extrabold text-slate-800 dark:text-slate-100 text-base">
              Chi tiết bài làm
              {detail && (
                <span className="ml-2 text-teal-600 dark:text-teal-400 font-bold">
                  — {detail.studentName}
                </span>
              )}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700 cursor-pointer text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
            </div>
          ) : detail ? (
            <div className="space-y-5">
              {/* Tóm tắt */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3.5 text-center border border-slate-100 dark:border-slate-700">
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-extrabold uppercase">
                    Tổng điểm
                  </p>
                  <p
                    className={`text-2xl font-black mt-1 ${
                      getScoreBadgeStyle(detail.totalScore).split(" ")[0]
                    }`}
                  >
                    {detail.totalScore}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3.5 text-center border border-slate-100 dark:border-slate-700">
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-extrabold uppercase">
                    Thời gian làm
                  </p>
                  <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100 mt-1">
                    {formatTime(detail.timeSpentSeconds)}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3.5 text-center border border-slate-100 dark:border-slate-700">
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-extrabold uppercase">
                    Nộp lúc
                  </p>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">
                    {formatDate(detail.submittedAt)}
                  </p>
                </div>
              </div>

              {/* Bảng chi tiết câu hỏi */}
              <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-2xl">
                <table className="w-full text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 dark:bg-slate-800/60 text-center">
                      <th className="px-3 py-3 text-center text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase">
                        Câu
                      </th>
                      <th className="px-3 py-3 text-center text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase">
                        Phần
                      </th>
                      <th className="px-3 py-3 text-center text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase">
                        Học sinh chọn
                      </th>
                      <th className="px-3 py-3 text-center text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase">
                        Đáp án đúng
                      </th>
                      <th className="px-3 py-3 text-center text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase">
                        Điểm
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {detail.details.map((d) => (
                      <tr
                        key={d.questionNumber}
                        className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/40 ${
                          d.isCorrect
                            ? "bg-emerald-50/20 dark:bg-emerald-950/10"
                            : "bg-rose-50/20 dark:bg-rose-950/10"
                        }`}
                      >
                        <td className="px-3 py-2.5 text-center font-bold text-slate-800 dark:text-slate-200">
                          {d.questionNumber}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md font-semibold">
                            {d.partType
                              .replace("PART_", "P")
                              .replace("_ABCD", "1")
                              .replace("_TRUE_FALSE", "2")
                              .replace("_SHORT_ANSWER", "3")}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-center font-mono text-slate-800 dark:text-slate-200 font-semibold">
                          {d.studentAnswer}
                        </td>
                        <td className="px-3 py-2.5 text-center font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                          {d.correctAnswer}
                        </td>
                        <td className="px-3 py-2.5 text-center font-bold">
                          <span
                            className={
                              d.isCorrect ? "text-emerald-600" : "text-rose-500"
                            }
                          >
                            {d.earnedPoints}/{d.maxPoints}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="text-center text-slate-500 py-8">
              Không tải được dữ liệu bài làm.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
