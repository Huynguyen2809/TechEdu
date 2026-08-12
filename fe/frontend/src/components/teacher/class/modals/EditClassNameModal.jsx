import React from "react";
import { X, AlertCircle } from "lucide-react";

export default function EditClassNameModal({
  isOpen,
  onClose,
  newClassName,
  setNewClassName,
  onSubmit,
  submittingEdit,
  editError
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="bg-indigo-600 text-white p-6 flex items-center justify-between border-b border-indigo-700 dark:border-slate-800">
          <div>
            <h3 className="font-extrabold text-lg leading-tight tracking-tight text-white">
              Đổi Tên Lớp Học
            </h3>
            <p className="text-xs text-indigo-100 mt-0.5">
              Cập nhật lại tên hiển thị cho lớp học này
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-5">
          {editError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{editError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Tên Lớp Mới <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              placeholder="Nhập tên lớp học mới..."
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-700 transition-all font-semibold"
              autoFocus
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={submittingEdit}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm shadow-md transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {submittingEdit ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Đang lưu...</span>
                </>
              ) : (
                <span>Lưu Thay Đổi</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
