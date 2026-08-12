import React from "react";
import { Trash2 } from "lucide-react";

export default function DeleteConfirmModal({
  deleteItemTarget,
  onClose,
  onDeleteSubmit,
  actionLoading,
  btnSecondary
}) {
  if (!deleteItemTarget) return null;

  const isFile = deleteItemTarget.itemType === "FILE";
  const itemName =
    deleteItemTarget.item.title || deleteItemTarget.item.name || "tài nguyên";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full overflow-hidden border border-slate-100 dark:border-slate-800 shadow-2xl p-6 text-center space-y-4">
        <div className="w-14 h-14 bg-rose-50 dark:bg-rose-950/80 text-rose-600 rounded-2xl flex items-center justify-center mx-auto border border-rose-200 dark:border-rose-800">
          <Trash2 className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
            Xác nhận xóa {isFile ? "File" : "Thư mục"}?
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate max-w-xs mx-auto">
            "{itemName}"
          </p>
          {!isFile && (
            <p className="text-[11px] text-rose-500 font-semibold pt-1">
              ⚠️ Lưu ý: Thư mục và tất cả nội dung bên trong sẽ bị xóa vĩnh viễn!
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onClose}
            className={`${btnSecondary} flex-1 py-2.5 px-4 text-sm`}
          >
            Hủy
          </button>
          <button
            onClick={onDeleteSubmit}
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
