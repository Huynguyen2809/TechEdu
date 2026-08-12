import React from "react";
import { Pencil, X } from "lucide-react";

export default function RenameModal({
  renameItemTarget,
  setRenameItemTarget,
  onClose,
  onSubmit,
  actionLoading,
  btnPrimary,
  btnSecondary
}) {
  if (!renameItemTarget) return null;

  const isFile = renameItemTarget.itemType === "FILE";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full overflow-hidden border border-slate-100 dark:border-slate-800 shadow-2xl cyber:bg-white cyber:border-2 cyber:border-slate-900 cyber:shadow-[6px_6px_0_0_#0f172a]">
        <div className="bg-indigo-600 text-white p-6 flex items-center justify-between border-b border-indigo-700 dark:border-slate-800">
          <div>
            <h3 className="font-extrabold text-lg leading-tight tracking-tight text-white flex items-center gap-2">
              <Pencil className="w-5 h-5 text-amber-300" />
              Đổi Tên {isFile ? "File PDF" : "Thư Mục"}
            </h3>
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
              Tên Mới <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={renameItemTarget.newName}
              onChange={(e) =>
                setRenameItemTarget({
                  ...renameItemTarget,
                  newName: e.target.value
                })
              }
              placeholder="Nhập tên mới..."
              className="w-full px-4 py-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 font-semibold text-slate-800 dark:text-slate-100"
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
              className={`${btnPrimary} flex-1 py-2.5 px-4 text-sm disabled:opacity-50 flex justify-center items-center gap-2`}
            >
              {actionLoading ? "Đang lưu..." : "Lưu Tên Mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
