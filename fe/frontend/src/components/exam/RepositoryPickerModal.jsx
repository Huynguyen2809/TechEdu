import React, { useState, useEffect } from "react";
import repositoryService from "../../services/repositoryService";
import {
  X, Folder, FileText, ChevronRight, ChevronLeft,
  Search, FolderOpen, AlertCircle,
} from "lucide-react";

/**
 * RepositoryPickerModal
 * Props:
 *   - onSelect(document)  — Gọi khi giáo viên chọn file PDF
 *   - onClose()           — Đóng modal
 */
export default function RepositoryPickerModal({ onSelect, onClose, filterType = "EXAM" }) {
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [breadcrumb, setBreadcrumb] = useState([]); // [{ id, name }]
  const [content, setContent] = useState({ folders: [], documents: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // Load nội dung thư mục
  const loadFolder = async (folderId, folderName) => {
    setLoading(true);
    setError("");
    try {
      const data = await repositoryService.getContent(folderId);
      setContent({
        folders: data.folders || [],
        documents: data.documents || [],
      });
      setCurrentFolderId(folderId);

      if (folderId === null) {
        setBreadcrumb([]);
      } else {
        setBreadcrumb((prev) => {
          // Kiểm tra xem đã trong breadcrumb chưa (click back)
          const existIdx = prev.findIndex((b) => b.id === folderId);
          if (existIdx >= 0) return prev.slice(0, existIdx + 1);
          return [...prev, { id: folderId, name: folderName }];
        });
      }
    } catch {
      setError("Không thể tải nội dung thư mục. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadFolder(null, ""); }, []);

  // Lọc tìm kiếm
  const filteredDocs = content.documents.filter(
    (d) =>
      d.title.toLowerCase().includes(search.toLowerCase()) &&
      (!filterType || d.fileType === filterType || d.title.toLowerCase().endsWith(".pdf"))
  );
  const filteredFolders = content.folders.filter(
    (f) => !search || f.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-slate-900 cyber:bg-white rounded-3xl shadow-2xl w-full max-w-xl flex flex-col max-h-[80vh] border border-slate-200 dark:border-slate-800 cyber:border-2 cyber:border-slate-900 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="font-extrabold text-slate-800 dark:text-slate-100">
              {filterType === "EXPLANATION" ? "Chọn file Lời Giải từ Kho lưu trữ" : "Chọn file từ Kho đề thi"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-1 px-5 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex-wrap">
          <button
            onClick={() => loadFolder(null, "")}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer flex items-center gap-1"
          >
            <FolderOpen className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
            <span>Kho đề thi</span>
          </button>
          {breadcrumb.map((b, i) => (
            <React.Fragment key={b.id}>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <button
                onClick={() => loadFolder(b.id, b.name)}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                {b.name}
              </button>
            </React.Fragment>
          ))}
          {breadcrumb.length > 0 && (
            <button
              onClick={() => {
                if (breadcrumb.length === 1) {
                  loadFolder(null, "");
                } else {
                  const prev = breadcrumb[breadcrumb.length - 2];
                  loadFolder(prev.id, prev.name);
                }
              }}
              className="ml-auto flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
            >
              <ChevronLeft className="w-3 h-3" />
              Quay lại
            </button>
          )}
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm file hoặc thư mục..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50/50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all duration-200"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-7 h-7 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 p-4 bg-rose-50 dark:bg-rose-950/30 rounded-xl text-rose-600 dark:text-rose-400 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          ) : filteredFolders.length === 0 && filteredDocs.length === 0 ? (
            <div className="flex flex-col items-center py-12 gap-3 text-slate-400 dark:text-slate-500">
              <FolderOpen className="w-10 h-10" />
              <p className="text-sm font-medium">
                {search ? "Không tìm thấy kết quả" : "Thư mục trống"}
              </p>
            </div>
          ) : (
            <>
              {/* Folders */}
              {filteredFolders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => loadFolder(folder.id, folder.name)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-indigo-50/70 dark:hover:bg-slate-800 transition-colors cursor-pointer text-left group"
                >
                  <Folder className="w-5 h-5 text-amber-400 shrink-0" />
                  <span className="flex-1 font-semibold text-slate-700 dark:text-slate-200 text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    {folder.name}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-indigo-400" />
                </button>
              ))}

              {/* Documents */}
              {filteredDocs.map((doc) => {
                const isSelectable = !filterType || doc.fileType === filterType;
                return (
                  <button
                    key={doc.id}
                    onClick={() => isSelectable && onSelect(doc)}
                    disabled={!isSelectable}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors cursor-pointer text-left group border
                      ${isSelectable
                        ? "hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:border-emerald-200 dark:hover:border-emerald-800 border-transparent"
                        : "opacity-50 cursor-not-allowed border-transparent"
                      }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isSelectable ? "bg-rose-50 dark:bg-rose-950/40" : "bg-slate-100 dark:bg-slate-800"}`}>
                      <FileText className={`w-4 h-4 ${isSelectable ? "text-rose-500 dark:text-rose-400" : "text-slate-400"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm truncate ${isSelectable ? "text-slate-800 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-300" : "text-slate-500"}`}>
                        {doc.title}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                        {doc.fileType} · {doc.fileSizeKb} KB
                      </p>
                    </div>
                    {isSelectable && (
                      <span className="shrink-0 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/60 px-2 py-0.5 rounded-full">
                        Chọn
                      </span>
                    )}
                  </button>
                );
              })}
            </>
          )}
        </div>

        {/* Footer hint */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl">
          <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
            {filterType === "EXPLANATION" ? (
              <span>Chỉ file loại <strong>EXPLANATION</strong> hoặc PDF mới có thể chọn làm lời giải</span>
            ) : (
              <span>Chỉ file có loại <strong>EXAM</strong> hoặc PDF mới có thể chọn làm đề thi</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
