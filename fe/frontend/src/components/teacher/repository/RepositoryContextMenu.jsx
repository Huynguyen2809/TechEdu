import React from "react";
import {
  FolderPlus,
  UploadCloud,
  RefreshCw,
  Eye,
  FileCheck2,
  FileText,
  FolderInput,
  FolderOpen,
  Pencil,
  Trash2
} from "lucide-react";

export default function RepositoryContextMenu({
  contextMenu,
  onClose,
  onOpenFolderModal,
  onOpenUploadModal,
  onRefresh,
  onSelectDoc,
  onToggleFileType,
  onOpenMoveModal,
  onOpenFolder,
  onOpenRenameModal,
  onOpenDeleteModal
}) {
  if (!contextMenu) return null;

  // Tính toán vị trí không vượt quá viền màn hình
  const menuWidth = 200;
  const menuHeight = 220;
  const winWidth = window.innerWidth || 1200;
  const winHeight = window.innerHeight || 800;

  const left = Math.max(10, Math.min(contextMenu.x, winWidth - menuWidth - 10));
  const top = Math.max(10, Math.min(contextMenu.y, winHeight - menuHeight - 10));

  return (
    <div
      style={{ top: `${top}px`, left: `${left}px` }}
      className="fixed z-50 min-w-[190px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-1.5 space-y-0.5 text-xs font-semibold text-slate-700 dark:text-slate-200 animate-in fade-in zoom-in-95 duration-100"
      onClick={(e) => e.stopPropagation()}
    >
      {contextMenu.itemType === "EMPTY" && (
        <>
          <button
            onClick={() => {
              onOpenFolderModal();
              onClose();
            }}
            className="w-full px-3 py-2 text-left rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-800 dark:text-slate-100 font-bold transition-colors cursor-pointer"
          >
            <FolderPlus className="w-4 h-4 text-indigo-500" />
            <span>Tạo thư mục mới</span>
          </button>

          <button
            onClick={() => {
              onOpenUploadModal();
              onClose();
            }}
            className="w-full px-3 py-2 text-left rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-800 dark:text-slate-100 font-bold transition-colors cursor-pointer"
          >
            <UploadCloud className="w-4 h-4 text-amber-500" />
            <span>Tải File PDF lên</span>
          </button>

          <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

          <button
            onClick={() => {
              onRefresh();
              onClose();
            }}
            className="w-full px-3 py-2 text-left rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-sky-500" />
            <span>Làm mới danh sách</span>
          </button>
        </>
      )}

      {contextMenu.itemType !== "EMPTY" && (
        <>
          {contextMenu.itemType === "FILE" && (
            <>
              <button
                onClick={() => {
                  onSelectDoc(contextMenu.item);
                  onClose();
                }}
                className="w-full px-3 py-2 text-left rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold transition-colors cursor-pointer"
              >
                <Eye className="w-4 h-4 text-indigo-500" />
                <span>Xem trực tiếp PDF</span>
              </button>

              <button
                onClick={(e) => {
                  onToggleFileType(contextMenu.item, e);
                  onClose();
                }}
                className="w-full px-3 py-2 text-left rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              >
                {contextMenu.item.fileType === "EXAM" || contextMenu.item.type === "EXAM" ? (
                  <>
                    <FileCheck2 className="w-4 h-4 text-emerald-500" />
                    <span>Chuyển thành Lời Giải</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 text-rose-500" />
                    <span>Chuyển thành Đề Thi</span>
                  </>
                )}
              </button>

              <button
                onClick={(e) => {
                  const item = contextMenu.item;
                  onClose();
                  onOpenMoveModal(item, e);
                }}
                className="w-full px-3 py-2 text-left rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              >
                <FolderInput className="w-4 h-4 text-sky-500" />
                <span>Di chuyển file</span>
              </button>
            </>
          )}

          {contextMenu.itemType === "FOLDER" && (
            <button
              onClick={() => {
                onOpenFolder(contextMenu.item);
                onClose();
              }}
              className="w-full px-3 py-2 text-left rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold transition-colors cursor-pointer"
            >
              <FolderOpen className="w-4 h-4 text-indigo-500" />
              <span>Mở thư mục</span>
            </button>
          )}

          <button
            onClick={(e) => {
              onClose();
              onOpenRenameModal(contextMenu.item, contextMenu.itemType, e);
            }}
            className="w-full px-3 py-2 text-left rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            <Pencil className="w-4 h-4 text-amber-500" />
            <span>Đổi tên</span>
          </button>

          <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

          <button
            onClick={(e) => {
              onClose();
              onOpenDeleteModal(contextMenu.item, contextMenu.itemType, e);
            }}
            className="w-full px-3 py-2 text-left rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center gap-2 font-bold transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4 text-rose-500" />
            <span>Xóa {contextMenu.itemType === "FILE" ? "File PDF" : "Thư mục"}</span>
          </button>
        </>
      )}
    </div>
  );
}
