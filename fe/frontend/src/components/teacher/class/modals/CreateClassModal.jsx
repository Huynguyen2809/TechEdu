import React from "react";
import { X, AlertCircle } from "lucide-react";

export default function CreateClassModal({
  isOpen,
  onClose,
  className,
  setClassName,
  selectedSubject,
  setSelectedSubject,
  customSubject,
  setCustomSubject,
  gradeLevel,
  setGradeLevel,
  onSubmit,
  submitting,
  modalError
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 dark:border-slate-800 cyber:bg-white cyber:border-2 cyber:border-slate-900 cyber:shadow-[6px_6px_0_0_#0f172a] cyber:rounded-2xl">
        {/* Header Modal */}
        <div className="bg-indigo-600 text-white p-6 flex items-center justify-between border-b border-indigo-700 dark:border-slate-800 cyber:border-b-2 cyber:border-slate-900">
          <div>
            <h3 className="font-extrabold text-lg leading-tight tracking-tight text-white">
              Tạo Lớp Học Mới
            </h3>
            <p className="text-xs text-indigo-100 mt-0.5">
              Hệ thống tự động tạo mã lớp học
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={onSubmit} className="p-6 space-y-5">
          {modalError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-xl text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2 cyber:bg-rose-100 cyber:text-rose-900 cyber:border-2 cyber:border-slate-900">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{modalError}</span>
            </div>
          )}

          {/* 1. Nhập Tên Lớp */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 cyber:text-slate-900">
              Tên Lớp Học <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="Nhập tên lớp học"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-700 transition-all font-semibold cyber:bg-white cyber:border-2 cyber:border-slate-900 cyber:text-slate-900 cyber:focus:ring-2 cyber:focus:ring-slate-900"
              autoFocus
            />
          </div>

          {/* 2. Môn Học */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 cyber:text-slate-900">
              Môn Học <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-700 transition-all cursor-pointer cyber:bg-white cyber:border-2 cyber:border-slate-900 cyber:text-slate-900"
            >
              <option value="Toán học">Toán học</option>
              <option value="Hóa học">Hóa học</option>
              <option value="Vật lý">Vật lý</option>
              <option value="Tiếng Anh">Tiếng Anh</option>
              <option value="Sinh học">Sinh học</option>
              <option value="OTHER">Môn khác ...</option>
            </select>

            {selectedSubject === "OTHER" && (
              <div className="mt-2.5">
                <input
                  type="text"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  placeholder="Nhập tên môn học khác ..."
                  className="w-full px-4 py-2.5 bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/60 rounded-xl text-sm font-semibold text-indigo-900 dark:text-indigo-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cyber:bg-white cyber:border-2 cyber:border-slate-900 cyber:text-slate-900"
                  autoFocus
                />
              </div>
            )}
          </div>

          {/* 3. Khối Lớp */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 cyber:text-slate-900">
              Khối Lớp <span className="text-rose-500">*</span>
            </label>
            <select
              value={gradeLevel}
              onChange={(e) => setGradeLevel(Number(e.target.value))}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-700 transition-all cursor-pointer cyber:bg-white cyber:border-2 cyber:border-slate-900 cyber:text-slate-900"
            >
              <option value={12}>Khối 12</option>
              <option value={11}>Khối 11</option>
              <option value={10}>Khối 10</option>
            </select>
          </div>

          {/* Footer Thao tác */}
          <div className="flex items-center gap-3 pt-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-white dark:bg-slate-800 cyber:bg-white hover:bg-slate-50 dark:hover:bg-slate-700 cyber:hover:bg-slate-100 text-slate-700 dark:text-slate-200 cyber:text-slate-900 font-semibold rounded-xl border border-slate-200 dark:border-slate-700 cyber:border-2 cyber:border-slate-900 flex-1 py-2.5 px-4 text-sm cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-indigo-600 dark:bg-indigo-500 cyber:bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl flex-1 py-2.5 px-4 text-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Đang tạo...</span>
                </>
              ) : (
                <span>Khởi Tạo Lớp</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
