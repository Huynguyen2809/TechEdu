import React from "react";
import { CheckCircle2, Clock, Calendar, FileText, ListChecks } from "lucide-react";

export default function ExamPreviewStep({
  title,
  className,
  durationMinutes,
  startTime,
  endTime,
  totalScore,
  totalQuestions,
  part1Count,
  part2Count,
  part3Count,
  selectedExamPdf
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-6 shadow-sm">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100">
          3. Xem Trước &amp; Xác Nhận Xuất Bản Bài Thi
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
          <p className="text-xs text-slate-400 font-extrabold uppercase">
            Tên đề thi
          </p>
          <p className="text-sm font-black text-slate-800 dark:text-slate-100 mt-1">
            {title || "(Chưa nhập tiêu đề)"}
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
          <p className="text-xs text-slate-400 font-extrabold uppercase">
            Lớp học áp dụng
          </p>
          <p className="text-sm font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {className || "(Chưa chọn lớp)"}
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
          <p className="text-xs text-slate-400 font-extrabold uppercase">
            Thời lượng &amp; Thang điểm
          </p>
          <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {durationMinutes} phút / Tổng {totalScore.toFixed(2)}đ
          </p>
        </div>
      </div>

      {/* Chi tiết ca thi */}
      <div className="bg-indigo-50/50 dark:bg-indigo-950/30 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/60 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-300">
          <Calendar className="w-4 h-4" />
          <span>Thời gian diễn ra ca thi:</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
          Mở đề: <span className="font-bold text-slate-800 dark:text-slate-100">{startTime || "—"}</span>
          {" ──> "}
          Đóng đề: <span className="font-bold text-slate-800 dark:text-slate-100">{endTime || "—"}</span>
        </p>
      </div>

      {/* Cấu trúc đề thi */}
      <div className="space-y-2">
        <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Cấu Trúc Ma Trận Đề Thi ({totalQuestions} câu)
        </p>
        <div className="grid grid-cols-3 gap-3 text-center text-xs">
          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
            <span className="font-extrabold text-indigo-600 block text-base">
              {part1Count}
            </span>
            <span className="text-slate-400 font-medium">Phần 1 (ABCD)</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
            <span className="font-extrabold text-indigo-600 block text-base">
              {part2Count}
            </span>
            <span className="text-slate-400 font-medium">Phần 2 (Đúng/Sai)</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
            <span className="font-extrabold text-indigo-600 block text-base">
              {part3Count}
            </span>
            <span className="text-slate-400 font-medium">Phần 3 (Ngắn)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
