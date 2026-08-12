import React from "react";
import { Trash2 } from "lucide-react";

export default function DeleteClassConfirmModal({
  classTarget,
  onClose,
  onConfirmDelete,
  actionLoading
}) {
  if (!classTarget) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full overflow-hidden border border-slate-100 dark:border-slate-800 shadow-2xl p-6 text-center space-y-4">
        <div className="w-14 h-14 bg-rose-50 dark:bg-rose-950/80 text-rose-600 rounded-2xl flex items-center justify-center mx-auto border border-rose-200 dark:border-rose-800">
          <Trash2 className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
            Xác nhận xóa lớp học?
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate max-w-xs mx-auto">
            "{classTarget.name}"
          </p>
          <p className="text-[11px] text-rose-500 font-semibold pt-1">
            ⚠️ Lưu ý: Tất cả danh sách học sinh và thông tin liên quan đến lớp này sẽ bị xóa!
          </p>
        </div>
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-200 transition-all cursor-pointer"
          >
            Hủy
          </button>
          <button
            onClick={onConfirmDelete}
            disabled={actionLoading}
            className="bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl px-4 py-2.5 flex-1 text-sm shadow-md disabled:opacity-50 transition-all cursor-pointer"
          >
            {actionLoading ? "Đang xóa..." : "Xóa Vĩnh Viễn"}
          </button>
        </div>
      </div>
    </div>
  );
}
