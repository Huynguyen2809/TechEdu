import React from "react";
import { X } from "lucide-react";

export default function CreateFolderModal({
  isOpen,
  onClose,
  newFolderName,
  setNewFolderName,
  onSubmit,
  actionLoading,
  btnPrimary,
  btnSecondary
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full overflow-hidden border border-slate-100 dark:border-slate-800 shadow-2xl">
        <div className="bg-teal-600 text-white p-6 flex items-center justify-between border-b border-teal-700 dark:border-slate-800">
          <div>
            <h3 className="font-extrabold text-lg leading-tight tracking-tight text-white">
              Tạo Thư Mục Mới
            </h3>
            <p className="text-xs text-teal-100 mt-0.5">
              Phân loại bài thi &amp; đề kiểm tra PDF
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Tên Thư Mục <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="tên thư mục ..."
              className="w-full px-4 py-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 font-semibold text-slate-800 dark:text-slate-100"
              autoFocus
            />
          </div>

          <div className="flex items-center gap-3 pt-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className={`${btnSecondary} flex-1 py-2.5 px-4 text-sm`}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className={`${btnPrimary} flex-1 py-2.5 px-4 text-sm disabled:opacity-50 flex items-center justify-center gap-2`}
            >
              {actionLoading ? "Đang tạo..." : "Tạo Thư Mục"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
