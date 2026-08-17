import React from "react";
import {
  Folder,
  FileText,
  UploadCloud,
  FileJson,
  MoreVertical
} from "lucide-react";

export default function RepositoryTable({
  folders,
  documents,
  loading,
  error,
  dragActive,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onOpenFolder,
  onSelectDoc,
  onContextMenu,
  onToggleFileType,
  onMoveDocument,
  onOpenUploadModal,
  btnPrimary
}) {
  return (
    <div
      className={`relative min-h-[420px] bg-white dark:bg-slate-900 rounded-3xl border ${
        dragActive
          ? "border-2 border-dashed border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20"
          : "border-slate-200/80 dark:border-slate-800"
      } shadow-sm dark:shadow-none overflow-hidden transition-all flex flex-col justify-between`}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onContextMenu={(e) => {
        e.preventDefault();
        onContextMenu(e, null, "EMPTY");
      }}
    >
      {dragActive && (
        <div className="absolute inset-0 bg-indigo-600/10 backdrop-blur-xs rounded-3xl flex flex-col items-center justify-center border-2 border-dashed border-indigo-600 z-30 pointer-events-none">
          <UploadCloud className="w-14 h-14 text-indigo-600 animate-bounce" />
          <p className="text-lg font-black text-indigo-900 dark:text-indigo-200 mt-2">
            Thả File PDF vào đây để Upload!
          </p>
        </div>
      )}

      {loading ? (
        <div className="py-24 text-center p-6 space-y-3">
          <div className="w-9 h-9 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-400 font-medium">Đang tải kho tài liệu...</p>
        </div>
      ) : error ? (
        <div className="text-rose-500 text-center py-16 text-sm font-medium p-6">
          {error}
        </div>
      ) : folders.length === 0 && documents.length === 0 ? (
        <div className="text-center py-20 space-y-4 my-auto p-6">
          <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 rounded-3xl flex items-center justify-center mx-auto border border-indigo-100 dark:border-indigo-900/60 shadow-2xs">
            <FileJson className="w-10 h-10" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Không tìm thấy dữ liệu phù hợp
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
              Tạo thư mục con, điều chỉnh bộ lọc hoặc Kéo &amp; Thả file PDF trực tiếp vào đây.
            </p>
          </div>
          <button
            onClick={onOpenUploadModal}
            className={`${btnPrimary} px-4 py-2.5 text-xs inline-flex items-center gap-2`}
          >
            <UploadCloud className="w-4 h-4 text-amber-300" /> Kéo / Tải File PDF
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto w-full">
          <table className="w-full text-center border-collapse table-fixed">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap">
                <th className="py-4 px-6 w-[55%] text-left">Tên</th>
                <th className="py-4 px-6 w-[20%] text-center">Loại file</th>
                <th className="py-4 px-6 w-[15%] text-center">Dung lượng</th>
                <th className="py-4 px-6 w-[10%] text-center whitespace-nowrap">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs font-semibold text-slate-700 dark:text-slate-200">
              {/* Hiển thị Folders */}
              {folders.map((folder) => (
                <tr
                  key={`folder-${folder.id}`}
                  onDoubleClick={() => onOpenFolder(folder)}
                  onContextMenu={(e) => onContextMenu(e, folder, "FOLDER")}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    try {
                      const dataStr = e.dataTransfer.getData("application/json");
                      if (dataStr) {
                        const payload = JSON.parse(dataStr);
                        if (payload.type === "DOC_MOVE" && payload.docId) {
                          onMoveDocument(payload.docId, folder.id);
                        }
                      }
                    } catch (err) {
                      console.error("Lỗi thả file vào thư mục:", err);
                    }
                  }}
                  className="hover:bg-amber-50/40 dark:hover:bg-amber-950/20 transition-colors cursor-pointer group"
                  title="Double Click để mở thư mục"
                >
                  <td className="py-3.5 px-6 text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center border border-amber-200/60 dark:border-amber-900/60 shrink-0 group-hover:scale-110 transition-transform">
                        <Folder className="w-5 h-5 fill-amber-400/20" />
                      </div>
                      <span className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {folder.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-6 text-center">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      Thư mục
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-center text-slate-400 font-mono text-[11px]">
                    --
                  </td>
                  <td className="py-3.5 px-6 text-center">
                    <button
                      onClick={(e) => onContextMenu(e, folder, "FOLDER")}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Menu tùy chọn"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {/* Hiển thị Files PDF */}
              {documents.map((doc) => {
                const isExam =
                  doc.fileType === "EXAM" ||
                  doc.type === "EXAM" ||
                  doc.documentType === "EXAM";

                return (
                  <tr
                    key={`doc-${doc.id}`}
                    draggable={true}
                    onDragStart={(e) => {
                      e.dataTransfer.setData(
                        "application/json",
                        JSON.stringify({
                          type: "DOC_MOVE",
                          docId: doc.id,
                          title: doc.title || doc.fileName
                        })
                      );
                    }}
                    onDoubleClick={() => onSelectDoc(doc)}
                    onContextMenu={(e) => onContextMenu(e, doc, "FILE")}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                    title="Double Click để xem file PDF"
                  >
                    <td className="py-3.5 px-6 text-left">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 group-hover:scale-110 transition-transform ${
                            isExam
                              ? "bg-rose-50 dark:bg-rose-950/60 text-rose-500 border-rose-200/60 dark:border-rose-900/60"
                              : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 border-emerald-200/60 dark:border-emerald-900/60"
                          }`}
                        >
                          <FileText className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                          {doc.title || doc.fileName}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <button
                        onClick={(e) => onToggleFileType(doc, e)}
                        title="Nhấp để chuyển đổi giữa Đề thi và Lời giải"
                        className="cursor-pointer hover:scale-105 transition-transform"
                      >
                        {isExam ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 transition-colors">
                            Đề Thi PDF
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors">
                            Lời Giải
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 px-6 text-center text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                      {doc.fileSizeKb ? `${doc.fileSizeKb} KB` : "--"}
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <button
                        onClick={(e) => onContextMenu(e, doc, "FILE")}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Menu tùy chọn"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
