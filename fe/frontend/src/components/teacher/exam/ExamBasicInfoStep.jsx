import React from "react";
import { FolderOpen, Calendar, Clock, FileText } from "lucide-react";

export default function ExamBasicInfoStep({
  examMode,
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
  onOpenRepoPicker,
  selectedExplanationPdf,
  selectedExplanationDocId,
  onOpenExplanationPicker,
  explanationPolicy,
  setExplanationPolicy
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 p-6 md:p-8 shadow-sm space-y-6 transition-all duration-300">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="p-2 bg-teal-50 dark:bg-teal-900/30 rounded-xl text-teal-600 dark:text-teal-400">
          <FileText className="w-5 h-5" />
        </div>
        <div className="flex-1 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-3">
              1. Thông Tin Cơ Bản Đề Thi
              {examMode === "THPT" ? (
                <span className="px-2.5 py-1 rounded-lg bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-400 text-[10px] font-black uppercase tracking-wider">Đề THPT</span>
              ) : (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider">Đề Tùy chỉnh</span>
              )}
            </h2>
            <p className="text-xs text-slate-500 font-medium">Nhập tên, chọn lớp và cài đặt thời gian</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tên đề thi */}
        <div className="md:col-span-2 group">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2 group-focus-within:text-teal-600 transition-colors">
            Tên Bài Thi / Đề Kiểm Tra <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ví dụ: Kiểm tra Giữa kỳ I - Hóa học 12"
            className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-2xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 focus:bg-white dark:focus:bg-slate-800 transition-all"
          />
        </div>

        {/* Lớp học */}
        <div className="group">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2 group-focus-within:text-teal-600 transition-colors">
            Lớp Học Nhận Bài Thi <span className="text-rose-500">*</span>
          </label>
          <select
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            required
            className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-2xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 focus:bg-white dark:focus:bg-slate-800 cursor-pointer transition-all"
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
        <div className="group">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2 group-focus-within:text-teal-600 transition-colors">
            Thời Gian Làm Bài (Phút) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Clock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
            <input
              type="number"
              min={1}
              max={300}
              required
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-2xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 focus:bg-white dark:focus:bg-slate-800 transition-all"
            />
          </div>
        </div>

        {/* Thời gian mở ca thi */}
        <div className="group">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2 group-focus-within:text-teal-600 transition-colors">
            Thời Gian Mở Bài Thi <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Calendar className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
            <input
              type="datetime-local"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-2xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 focus:bg-white dark:focus:bg-slate-800 cursor-pointer transition-all"
            />
          </div>
        </div>

        {/* Thời gian đóng ca thi */}
        <div className="group">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2 group-focus-within:text-teal-600 transition-colors">
            Thời Gian Đóng Bài Thi <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Calendar className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
            <input
              type="datetime-local"
              required
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-2xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 focus:bg-white dark:focus:bg-slate-800 cursor-pointer transition-all"
            />
          </div>
        </div>
      </div>

      {/* Chọn File PDF từ Ngân Hàng Đề */}
      <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-3">
          File PDF Đề Thi (Từ Kho Tài Nguyên) <span className="text-rose-500">*</span>
        </label>
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border-2 transition-all ${
          selectedDocId
            ? "border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-900/10"
            : "border-rose-200 dark:border-rose-800/60 bg-rose-50/50 dark:bg-rose-900/10 border-dashed"
        }`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm ${
              selectedDocId
                ? "bg-white dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/60"
                : "bg-white dark:bg-rose-900/40 text-rose-500 dark:text-rose-400 border-rose-100 dark:border-rose-800/60"
            }`}>
              <FolderOpen className="w-6 h-6" />
            </div>
            <div>
              <p className={`text-sm font-extrabold ${selectedDocId ? "text-slate-800 dark:text-slate-100" : "text-rose-600 dark:text-rose-400"}`}>
                {selectedExamPdf
                  ? selectedExamPdf.title || selectedExamPdf.fileName
                  : "⚠ Bắt buộc — Chưa chọn file PDF đề thi"}
              </p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {selectedDocId
                  ? `ID Tài liệu: #${selectedDocId}`
                  : "Nhấn nút bên cạnh để chọn file PDF từ kho tài liệu"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenRepoPicker}
            className={`px-5 py-2.5 font-bold text-sm rounded-xl transition-all cursor-pointer shadow-sm whitespace-nowrap active:scale-95 flex-shrink-0 ${
              selectedDocId
                ? "bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                : "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20 shadow-lg animate-pulse hover:animate-none"
            }`}
          >
            {selectedDocId ? "Đổi File PDF" : "Chọn File PDF"}
          </button>
        </div>
      </div>

      {/* Chọn File PDF Lời Giải */}
      <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-3">
          File PDF Lời Giải (Tùy chọn)
        </label>
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border-2 transition-all ${
          selectedExplanationDocId
            ? "border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/50 dark:bg-indigo-900/10"
            : "border-slate-200 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/10 border-dashed"
        }`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm ${
              selectedExplanationDocId
                ? "bg-white dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800/60"
                : "bg-white dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700/60"
            }`}>
              <FolderOpen className="w-6 h-6" />
            </div>
            <div>
              <p className={`text-sm font-extrabold ${selectedExplanationDocId ? "text-slate-800 dark:text-slate-100" : "text-slate-500 dark:text-slate-400"}`}>
                {selectedExplanationPdf
                  ? selectedExplanationPdf.title || selectedExplanationPdf.fileName
                  : "Chưa chọn file lời giải"}
              </p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {selectedExplanationDocId
                  ? `ID Tài liệu: #${selectedExplanationDocId}`
                  : "Học sinh có thể xem sau khi thi (nếu bạn cho phép)"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenExplanationPicker}
            className="px-5 py-2.5 font-bold text-sm rounded-xl transition-all cursor-pointer shadow-sm whitespace-nowrap active:scale-95 flex-shrink-0 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
          >
            {selectedExplanationDocId ? "Đổi Lời Giải" : "Chọn Lời Giải"}
          </button>
        </div>

        {/* Cấu hình xem lời giải */}
        {selectedExplanationDocId && (
          <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/60">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
              Thời Điểm Cho Phép Học Sinh Xem Đáp Án / Lời Giải
            </label>
            <select
              value={explanationPolicy}
              onChange={(e) => setExplanationPolicy(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 cursor-pointer transition-all"
            >
              <option value="AFTER_EXAM_END">Sau khi đóng ca thi (An toàn nhất)</option>
              <option value="IMMEDIATELY">Ngay sau khi học sinh nộp bài</option>
              <option value="NEVER">Không bao giờ cho xem</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
