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
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 p-6 md:p-8 space-y-6 shadow-sm transition-all duration-300">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">
            3. Xem Trước &amp; Xác Nhận Xuất Bản Bài Thi
          </h2>
          <p className="text-xs text-slate-500 font-medium">Kiểm tra lại toàn bộ thông tin trước khi phát hành</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" /> Tên đề thi
          </p>
          <p className="text-sm font-black text-slate-900 dark:text-slate-100 leading-tight">
            {title || "(Chưa nhập tiêu đề)"}
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
            <ListChecks className="w-3.5 h-3.5" /> Lớp học áp dụng
          </p>
          <p className="text-sm font-black text-indigo-600 dark:text-indigo-400 leading-tight">
            {className || "(Chưa chọn lớp)"}
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Thời lượng &amp; Thang điểm
          </p>
          <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 leading-tight">
            {durationMinutes} phút / Tổng {totalScore.toFixed(2)}đ
          </p>
        </div>
      </div>

      {/* Chi tiết ca thi */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 p-5 rounded-2xl border border-indigo-100/60 dark:border-indigo-800/40 space-y-3 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-black text-indigo-800 dark:text-indigo-300">
          <Calendar className="w-5 h-5" />
          <span>Thời gian diễn ra ca thi:</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-sm text-slate-600 dark:text-slate-300 font-medium pl-7">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span>Mở đề: <span className="font-bold text-slate-900 dark:text-slate-100">{startTime ? new Date(startTime).toLocaleString("vi-VN") : "—"}</span></span>
          </div>
          <div className="hidden sm:block text-slate-300 dark:text-slate-600">⟶</div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-rose-500"></div>
            <span>Đóng đề: <span className="font-bold text-slate-900 dark:text-slate-100">{endTime ? new Date(endTime).toLocaleString("vi-VN") : "—"}</span></span>
          </div>
        </div>
      </div>

      {/* Cấu trúc đề thi */}
      <div className="space-y-3 pt-2">
        <p className="text-xs font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-widest text-center">
          Cấu Trúc Ma Trận Đề Thi ({totalQuestions} câu)
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="bg-white dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm flex flex-col items-center justify-center gap-1">
            <span className="font-black text-indigo-600 dark:text-indigo-400 text-3xl leading-none">
              {part1Count}
            </span>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Phần 1 (Trắc nghiệm)</span>
          </div>
          <div className="bg-white dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm flex flex-col items-center justify-center gap-1">
            <span className="font-black text-emerald-600 dark:text-emerald-400 text-3xl leading-none">
              {part2Count}
            </span>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Phần 2 (Đúng / Sai)</span>
          </div>
          <div className="bg-white dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm flex flex-col items-center justify-center gap-1">
            <span className="font-black text-rose-600 dark:text-rose-400 text-3xl leading-none">
              {part3Count}
            </span>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Phần 3 (Trả lời ngắn)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
