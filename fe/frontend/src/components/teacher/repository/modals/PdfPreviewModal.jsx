import React from "react";
import { FileText, FolderInput, Download, ArrowUpRight, X } from "lucide-react";
import { getApiFileUrl } from "../../../../utils/fileUrl";

export default function PdfPreviewModal({
  selectedDoc,
  onClose,
  onOpenMoveModal
}) {
  if (!selectedDoc) return null;

  const pdfUrl = getApiFileUrl(selectedDoc.fileUrl);
  const isExam =
    selectedDoc.fileType === "EXAM" ||
    selectedDoc.type === "EXAM" ||
    selectedDoc.documentType === "EXAM";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-5xl w-full h-[90vh] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col">
        {/* Header Modal PDF */}
        <div className="bg-teal-600 text-white px-6 py-4 flex items-center justify-between border-b border-teal-700 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3 min-w-0 pr-4">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
              <FileText className="w-5 h-5 text-amber-300" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base tracking-tight text-white truncate max-w-md">
                  {selectedDoc.title || selectedDoc.fileName || "Tài liệu PDF"}
                </h3>
                {isExam ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-200 border border-rose-400/30 shrink-0">
                    Đề Thi PDF
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 shrink-0">
                    Lời Giải
                  </span>
                )}
              </div>
              <p className="text-xs text-teal-100 mt-0.5">
                Dung lượng:{" "}
                {selectedDoc.fileSizeKb
                  ? `${selectedDoc.fileSizeKb} KB`
                  : "Định dạng PDF"}
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={(e) => onOpenMoveModal(selectedDoc, e)}
              className="px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 border border-white/20 transition-all cursor-pointer"
              title="Di chuyển file sang thư mục khác"
            >
              <FolderInput className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline">Di Chuyển</span>
            </button>
            <a
              href={pdfUrl}
              download={selectedDoc.title || selectedDoc.fileName || "document.pdf"}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 border border-white/20 transition-all cursor-pointer"
              title="Tải xuống file PDF"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Tải Về</span>
            </a>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 border border-white/20 transition-all cursor-pointer"
              title="Mở trong tab mới toàn màn hình"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span className="hidden sm:inline">Tab Mới</span>
            </a>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Cửa sổ xem trước PDF Embedded */}
        <div className="flex-1 bg-slate-100 dark:bg-slate-950 p-2 sm:p-4 overflow-hidden relative">
          <iframe
            src={pdfUrl}
            title={selectedDoc.title || "PDF Preview"}
            className="w-full h-full rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner bg-white dark:bg-slate-900"
          />
        </div>
      </div>
    </div>
  );
}
