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
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 dark:border-slate-800">
        {/* Header Modal */}
        <div className="bg-indigo-600 text-white p-6 flex items-center justify-between border-b border-indigo-700 dark:border-slate-800">
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
            <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-xl text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{modalError}</span>
            </div>
          )}

          {/* 1. Nhập Tên Lớp */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Tên Lớp Học <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="Nhập tên lớp học"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-700 transition-all font-semibold:ring-2:ring-slate-900"
              autoFocus
            />
          </div>

          {/* 2. Môn Học */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Môn Học <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-700 transition-all cursor-pointer"
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
                  className="w-full px-4 py-2.5 bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/60 rounded-xl text-sm font-semibold text-indigo-900 dark:text-indigo-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  autoFocus
                />
              </div>
            )}
          </div>

          {/* 3. Khối Lớp */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Khối Lớp <span className="text-rose-500">*</span>
            </label>
            <select
              value={gradeLevel}
              onChange={(e) => setGradeLevel(Number(e.target.value))}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-700 transition-all cursor-pointer"
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
              className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700:bg-slate-100 text-slate-700 dark:text-slate-200 font-semibold rounded-xl border border-slate-200 dark:border-slate-700 flex-1 py-2.5 px-4 text-sm cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 text-white font-semibold rounded-xl flex-1 py-2.5 px-4 text-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
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
