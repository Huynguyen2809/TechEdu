import React from "react";
import { FolderOpen, Calendar, Clock, FileText } from "lucide-react";

export default function ExamBasicInfoStep({
  title,
  setTitle,
  classId,
  setClassId,
  classes,
  durationMinutes,
  setDurationMinutes,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  selectedExamPdf,
  selectedDocId,
  onOpenRepoPicker
}) {
  return (
    <div className="bg-white dark:bg-slate-900 cyber:bg-white rounded-3xl border border-slate-200/80 dark:border-slate-800 cyber:border-2 cyber:border-slate-900 p-6 shadow-sm dark:shadow-none cyber:shadow-[3px_3px_0_0_#0f172a] space-y-6">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
        <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100">
          1. Thông Tin Cơ Bản Đề Thi
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Tên đề thi */}
        <div className="md:col-span-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Tên Bài Thi / Đề Kiểm Tra <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ví dụ: Kiểm tra Giữa kỳ I - Hóa học 12"
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Lớp học */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Lớp Học Nhận Bài Thi <span className="text-rose-500">*</span>
          </label>
          <select
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            required
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="">-- Chọn lớp học --</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name} ({cls.subjectName || "Hóa học"} - Khối {cls.gradeLevel})
              </option>
            ))}
          </select>
        </div>

        {/* Thời gian làm bài */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Thời Gian Làm Bài (Phút) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Clock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="number"
              min={1}
              max={300}
              required
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Thời gian mở ca thi */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Thời Gian Mở Bài Thi <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="datetime-local"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Thời gian đóng ca thi */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Thời Gian Đóng Bài Thi <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="datetime-local"
              required
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Chọn File PDF từ Ngân Hàng Đề */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
          File PDF Đề Thi (Từ Kho Tài Nguyên) <span className="text-rose-500">*</span>
        </label>
        <div className={`flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border transition-colors ${
          selectedDocId
            ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50/30 dark:bg-emerald-950/20"
            : "border-rose-300 dark:border-rose-700"
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
              selectedDocId
                ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200/60"
                : "bg-rose-50 dark:bg-rose-950/60 text-rose-400 dark:text-rose-400 border-rose-200/60"
            }`}>
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <p className={`text-xs font-extrabold ${selectedDocId ? "text-slate-800 dark:text-slate-100" : "text-rose-600 dark:text-rose-400"}`}>
                {selectedExamPdf
                  ? selectedExamPdf.title || selectedExamPdf.fileName
                  : "⚠ Bắt buộc — Chưa chọn file PDF đề thi"}
              </p>
              <p className="text-[11px] text-slate-400 font-medium">
                {selectedDocId
                  ? `ID Tài liệu: #${selectedDocId}`
                  : "Nhấn nút bên cạnh để chọn file PDF từ kho tài liệu"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenRepoPicker}
            className={`px-4 py-2 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm whitespace-nowrap ${
              selectedDocId
                ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                : "bg-rose-600 hover:bg-rose-700 text-white animate-pulse"
            }`}
          >
            {selectedDocId ? "Đổi File PDF" : "Chọn File PDF *"}
          </button>
        </div>
      </div>
    </div>
  );
}
