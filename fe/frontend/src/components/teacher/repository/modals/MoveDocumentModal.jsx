import React from "react";
import { FolderInput, X, Move } from "lucide-react";

export default function MoveDocumentModal({
  moveDocTarget,
  onClose,
  allFoldersList,
  selectedTargetFolderId,
  setSelectedTargetFolderId,
  onMoveSubmit,
  actionLoading,
  btnPrimary,
  btnSecondary
}) {
  if (!moveDocTarget) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full overflow-hidden border border-slate-100 dark:border-slate-800 shadow-2xl">
        <div className="bg-teal-600 text-white p-6 flex items-center justify-between border-b border-teal-700 dark:border-slate-800">
          <div>
            <h3 className="font-extrabold text-lg leading-tight tracking-tight text-white flex items-center gap-2">
              <FolderInput className="w-5 h-5 text-amber-300" /> Di Chuyển File PDF
            </h3>
            <p className="text-xs text-teal-100 mt-0.5 truncate max-w-xs">
              {moveDocTarget.title || moveDocTarget.fileName || "File PDF"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Chọn Thư Mục Đích <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedTargetFolderId}
              onChange={(e) => setSelectedTargetFolderId(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-teal-500 cursor-pointer"
            >
              <option value="">📁 Thư mục gốc</option>
              {allFoldersList.map((f) => (
                <option key={f.id} value={f.id}>
                  📂 {f.name}
                </option>
              ))}
            </select>
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
              onClick={() =>
                onMoveSubmit(
                  moveDocTarget.id,
                  selectedTargetFolderId || null
                )
              }
              disabled={actionLoading}
              className={`${btnPrimary} flex-1 py-2.5 px-4 text-sm disabled:opacity-50 flex justify-center items-center gap-2`}
            >
              {actionLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <Move className="w-4 h-4 text-amber-300" />
              )}
              Xác Nhận Chuyển
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
