import React from "react";
import { X, FileText, FileCheck2, UploadCloud } from "lucide-react";

export default function UploadModal({
  isOpen,
  onClose,
  uploadFile,
  setUploadFile,
  uploadFileType,
  setUploadFileType,
  onUploadSubmit,
  actionLoading,
  btnPrimary,
  btnSecondary
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full overflow-hidden border border-slate-100 dark:border-slate-800 shadow-2xl">
        <div className="bg-indigo-600 text-white p-6 flex items-center justify-between border-b border-indigo-700 dark:border-slate-800">
          <div>
            <h3 className="font-extrabold text-lg leading-tight tracking-tight text-white">
              Tải Lên File PDF
            </h3>
            <p className="text-xs text-indigo-100 mt-0.5">
              Tải đề thi hoặc file lời giải chi tiết
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
              Phân Loại Tài Liệu
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setUploadFileType("EXAM")}
                className={`px-3 py-2.5 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  uploadFileType === "EXAM"
                    ? "bg-rose-50 text-rose-700 border-rose-300 ring-2 ring-rose-500/20 dark:bg-rose-950/80 dark:text-rose-300"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                }`}
              >
                <FileText className="w-4 h-4 text-rose-600" /> Đề Thi PDF
              </button>

              <button
                type="button"
                onClick={() => setUploadFileType("EXPLANATION")}
                className={`px-3 py-2.5 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  uploadFileType === "EXPLANATION"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-300 ring-2 ring-emerald-500/20 dark:bg-emerald-950/80 dark:text-emerald-300"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                }`}
              >
                <FileCheck2 className="w-4 h-4 text-emerald-600" /> Lời Giải
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              File PDF <span className="text-rose-500">*</span>
            </label>
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 bg-slate-50/70 dark:bg-slate-800/50 hover:bg-indigo-50/30 rounded-2xl p-6 text-center transition-all cursor-pointer relative">
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setUploadFile(e.target.files[0])}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
              />
              {uploadFile ? (
                <div className="space-y-1">
                  <FileText className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate max-w-xs mx-auto">
                    {uploadFile.name}
                  </p>
                  <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                    {(uploadFile.size / 1024).toFixed(1)} KB • Bấm để chọn lại
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <UploadCloud className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Kéo &amp; Thả file PDF vào đây
                  </p>
                  <p className="text-[11px] text-slate-400">
                    hoặc bấm để duyệt file từ máy tính
                  </p>
                </div>
              )}
            </div>
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
              onClick={onUploadSubmit}
              disabled={actionLoading || !uploadFile}
              className={`${btnPrimary} flex-1 py-2.5 px-4 text-sm disabled:opacity-50 flex justify-center items-center gap-2`}
            >
              {actionLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <UploadCloud className="w-4 h-4 text-amber-300" />
              )}
              Tải Lên File
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
