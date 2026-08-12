import React, { useState } from "react";
import {
  FolderLock,
  Upload,
  Search,
  FileText,
  FileSpreadsheet,
  Download,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  File,
  Calendar,
  HardDrive
} from "lucide-react";
import centerManagerService from "../../services/centerManagerService";

export default function DocumentManagement() {
  const [documents, setDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [docName, setDocName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [formError, setFormError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Toast State
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3500);
  };

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const response = await centerManagerService.getAllDocuments();
      setDocuments(response);
    } catch (error) {
      console.error("Lỗi khi tải danh sách tài liệu:", error);
      showToast("Không thể tải danh sách tài liệu", "error");
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchDocuments();
  }, []);

  const handleOpenModal = () => {
    setDocName("");
    setSelectedFile(null);
    setFormError("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setDocName("");
    setSelectedFile(null);
    setFormError("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      if (!docName) {
        setDocName(file.name.substring(0, file.name.lastIndexOf('.')) || file.name);
      }
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!docName.trim()) {
      setFormError("Vui lòng nhập tên tài liệu!");
      return;
    }
    if (!selectedFile) {
      setFormError("Vui lòng chọn file tải lên!");
      return;
    }

    setIsUploading(true);
    setFormError("");
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("name", docName.trim());

      await centerManagerService.uploadDocument(formData);
      showToast(`Đã tải lên tài liệu "${docName.trim()}" thành công!`);
      fetchDocuments();
      handleCloseModal();
    } catch (error) {
      console.error("Upload error:", error);
      setFormError(error.response?.data?.message || "Có lỗi xảy ra khi tải lên tài liệu");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa tài liệu "${name}" không?`)) {
      try {
        await centerManagerService.deleteDocument(id);
        showToast(`Đã xóa tài liệu "${name}"!`);
        fetchDocuments();
      } catch (error) {
        console.error("Delete error:", error);
        showToast("Không thể xóa tài liệu", "error");
      }
    }
  };

  const handleDownload = (doc) => {
    if (doc.fileUrl) {
      window.open(`http://localhost:8080${doc.fileUrl}`, '_blank');
      showToast(`Đang mở "${doc.name}"...`, "success");
    } else {
      showToast("Không tìm thấy đường dẫn tải file", "error");
    }
  };

  const filteredDocuments = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.fileType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFileBadge = (fileType) => {
    switch (fileType) {
      case "PDF":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-rose-50 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/60 shadow-sm whitespace-nowrap">
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span>PDF</span>
          </span>
        );
      case "DOCX":
      case "DOC":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 shadow-sm whitespace-nowrap">
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span>DOCX</span>
          </span>
        );
      case "XLSX":
      case "XLS":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 shadow-sm whitespace-nowrap">
            <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" />
            <span>EXCEL</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 shadow-sm whitespace-nowrap">
            <File className="w-3.5 h-3.5 shrink-0" />
            <span>{fileType}</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 font-sans animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Toast notification */}
      {toast.show && (
        <div
          className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-300 border backdrop-blur-md text-sm font-bold ${
            toast.type === "warning" || toast.type === "error"
              ? "bg-rose-500/90 text-white border-rose-400"
              : "bg-emerald-600/90 text-white border-emerald-400"
          }`}
        >
          {toast.type === "warning" || toast.type === "error" ? (
             <AlertCircle className="w-5 h-5 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* HEADER TRANG & ACTION */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 md:p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
        <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/40 rounded-xl text-indigo-600 dark:text-indigo-400">
            <FolderLock className="w-6 h-6 shrink-0" />
          </div>
          Kho Tài liệu Chung
        </h1>

        <button
          onClick={handleOpenModal}
          className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold px-5 py-3 rounded-xl shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer shrink-0 whitespace-nowrap active:scale-95 border border-indigo-500/30"
        >
          <Upload className="w-5 h-5 stroke-[2.5] shrink-0" />
          Tải lên tài liệu
        </button>
      </div>

      {/* STATS & SEARCH TOOLBAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 rounded-xl px-4 py-2.5 shadow-sm flex items-center gap-3">
            <div className="p-2 bg-white dark:bg-slate-900 rounded-lg text-indigo-500 shadow-sm border border-slate-100 dark:border-slate-800">
              <HardDrive className="w-5 h-5 shrink-0" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider mb-0.5">Tổng số tài liệu</p>
              <p className="text-lg font-black text-slate-900 dark:text-slate-100 leading-none">{documents.length}</p>
            </div>
          </div>
        </div>

        <div className="relative min-w-[280px] w-full sm:max-w-md">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm tài liệu..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* BẢNG DỮ LIỆU */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full min-h-[320px]">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200/60 dark:border-slate-800/60 text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6 w-16 text-center whitespace-nowrap">STT</th>
                <th className="py-4 px-6 whitespace-nowrap">Tên tài liệu</th>
                <th className="py-4 px-6 text-center whitespace-nowrap">Định dạng</th>
                <th className="py-4 px-6 whitespace-nowrap">Dung lượng</th>
                <th className="py-4 px-6 whitespace-nowrap">Ngày tải lên</th>
                <th className="py-4 px-6 text-center w-36 whitespace-nowrap">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
              {filteredDocuments.length > 0 ? (
                filteredDocuments.map((doc, index) => (
                  <tr
                    key={doc.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
                  >
                    <td className="py-4 px-6 font-bold text-slate-400 dark:text-slate-500 text-center whitespace-nowrap">
                      {index + 1}
                    </td>

                    <td className="py-4 px-6 font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-800/60">
                          <FileText className="w-5 h-5" />
                        </div>
                        <span
                          className="max-w-[300px] sm:max-w-[380px] truncate block"
                          title={doc.name}
                        >
                          {doc.name}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-center whitespace-nowrap">
                      {getFileBadge(doc.fileType)}
                    </td>

                    <td className="py-4 px-6 font-mono text-xs text-slate-500 dark:text-slate-400 font-bold whitespace-nowrap">
                      {doc.size}
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-500 dark:text-slate-400 font-bold whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400">
                          <Calendar className="w-3.5 h-3.5 shrink-0" />
                        </div>
                        <span>{doc.uploadedDate}</span>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleDownload(doc)}
                          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors cursor-pointer border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800/60"
                          title="Tải xuống/Xem"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(doc.id, doc.name)}
                          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors cursor-pointer border border-transparent hover:border-rose-200 dark:hover:border-rose-800/60"
                          title="Xóa tài liệu"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-16 text-center whitespace-nowrap">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FolderLock className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                      <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">Không tìm thấy tài liệu nào phù hợp.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL UPLOAD TÀI LIỆU */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/60 dark:border-slate-800/60 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="font-black text-slate-900 dark:text-slate-100 text-lg flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl text-indigo-600 dark:text-indigo-400">
                  <Upload className="w-5 h-5" />
                </div>
                Tải lên tài liệu
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 space-y-5">
              {formError && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-4">
                <div className="group">
                  <label className="block text-xs font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2 group-focus-within:text-indigo-600 transition-colors">
                    <File className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-500" />
                    Chọn tập tin <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-3 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer border border-slate-200/60 dark:border-slate-700/60 rounded-xl p-1 bg-slate-50 dark:bg-slate-800/50 shadow-sm transition-all focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>

                <div className="group">
                  <label className="block text-xs font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2 group-focus-within:text-indigo-600 transition-colors">
                    <FileText className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-500" />
                    Tên hiển thị <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                    placeholder="Ví dụ: Quy chế chuyên môn 2026"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-bold transition-all"
                  />
                </div>
              </div>

              <div className="pt-6 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800/60">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center min-w-[120px] active:scale-95 border border-indigo-500/30"
                >
                  {isUploading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "Tải lên"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
