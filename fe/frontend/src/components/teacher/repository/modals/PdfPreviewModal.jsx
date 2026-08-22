import React from "react";
import { FileText, FolderInput, Download, ArrowUpRight, X } from "lucide-react";
import { getApiFileUrl } from "../../../../utils/fileUrl";

export default function PdfPreviewModal({
  selectedDoc,
  onClose
}) {
  if (!selectedDoc) return null;

  const rawUrl = getApiFileUrl(selectedDoc.fileUrl);
  // Thêm parameters #toolbar=0&navpanes=0 để ẩn thanh công cụ / thanh chức năng mặc định của trình duyệt
  const pdfUrl = rawUrl ? `${rawUrl}#toolbar=0&navpanes=0` : "";
  const isExam =
    selectedDoc.fileType === "EXAM" ||
    selectedDoc.type === "EXAM" ||
    selectedDoc.documentType === "EXAM";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-5xl w-full h-[92vh] overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-2xl flex flex-col">
        {/* Header Modal PDF */}
        <div className="bg-teal-600 dark:bg-teal-700 text-white px-5 py-3.5 flex items-center justify-between border-b border-teal-700/60 dark:border-slate-800 shrink-0 shadow-sm">
          <div className="flex items-center gap-3 min-w-0 pr-4">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center border border-white/20 shrink-0">
              <FileText className="w-5 h-5 text-amber-300" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base tracking-tight text-white truncate max-w-xs sm:max-w-md">
                  {selectedDoc.title || selectedDoc.fileName || selectedDoc.name || "Tài liệu PDF"}
                </h3>
                {isExam ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/25 text-rose-100 border border-rose-400/30 shrink-0">
                    Đề Thi
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/25 text-emerald-100 border border-emerald-400/30 shrink-0">
                    Tài liệu
                  </span>
                )}
              </div>
              <p className="text-[11px] text-teal-100 mt-0.5">
                Dung lượng:{" "}
                {selectedDoc.fileSizeKb
                  ? `${selectedDoc.fileSizeKb} KB`
                  : selectedDoc.size || "Định dạng PDF"}
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={rawUrl}
              download={selectedDoc.title || selectedDoc.fileName || "document.pdf"}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 bg-white/15 hover:bg-white/25 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 border border-white/20 transition-all cursor-pointer shadow-xs active:scale-95"
              title="Tải xuống file PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tải Về</span>
            </a>
            <a
              href={rawUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 bg-white/15 hover:bg-white/25 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 border border-white/20 transition-all cursor-pointer shadow-xs active:scale-95"
              title="Mở trong tab mới toàn màn hình"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Toàn Màn Hình</span>
            </a>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-1.5 rounded-xl hover:bg-white/15 transition-colors cursor-pointer"
              title="Đóng cửa sổ"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cửa sổ xem trước PDF Không viền (Borderless Viewer) */}
        <div className="flex-1 bg-slate-900 overflow-hidden relative w-full h-full">
          <iframe
            src={pdfUrl}
            title={selectedDoc.title || "PDF Preview"}
            className="w-full h-full border-0 block bg-slate-900"
          />
        </div>
      </div>
    </div>
  );
}
