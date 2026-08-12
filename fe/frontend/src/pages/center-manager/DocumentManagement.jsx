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
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 whitespace-nowrap">
            <FileText className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>PDF</span>
          </span>
        );
      case "DOCX":
      case "DOC":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60 whitespace-nowrap">
            <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>DOCX</span>
          </span>
        );
      case "XLSX":
      case "XLS":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60 whitespace-nowrap">
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>EXCEL</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 whitespace-nowrap">
            <File className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>{fileType}</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast notification */}
      {toast.show && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce border text-sm font-medium ${
            toast.type === "warning"
              ? "bg-amber-600 text-white border-amber-500"
              : "bg-emerald-600 text-white border-emerald-500"
          }`}
        >
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* HEADER TRANG & ACTION */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
          <FolderLock className="w-7 h-7 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span className="whitespace-nowrap">Kho Tài liệu Chung</span>
        </h1>

        <button
          onClick={handleOpenModal}
          className="bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm cursor-pointer shrink-0 whitespace-nowrap"
        >
          <Upload className="w-4 h-4 stroke-[2.5] shrink-0" />
          <span>Tải lên tài liệu</span>
        </button>
      </div>

      {/* STATS & SEARCH TOOLBAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl px-4 py-3 shadow-xs flex items-center gap-3">
            <HardDrive className="w-5 h-5 text-indigo-500 shrink-0" />
            <div>
              <p className="text-xs text-slate-400 font-medium whitespace-nowrap">Tổng số tài liệu</p>
              <p className="text-lg font-black text-slate-800 dark:text-slate-100">{documents.length}</p>
            </div>
          </div>
        </div>

        <div className="relative min-w-[280px] flex-1 sm:max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm tài liệu..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all shadow-xs"
          />
        </div>
      </div>

      {/* BẢNG DỮ LIỆU CHỐNG VỠ CAO HÀNG & RỚT CHỮ */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto w-full min-h-[320px]">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6 w-16 text-center whitespace-nowrap">STT</th>
                <th className="py-4 px-6 whitespace-nowrap">Tên tài liệu</th>
                <th className="py-4 px-6 text-center whitespace-nowrap">Định dạng</th>
                <th className="py-4 px-6 whitespace-nowrap">Dung lượng</th>
                <th className="py-4 px-6 whitespace-nowrap">Ngày tải lên</th>
                <th className="py-4 px-6 text-center w-32 whitespace-nowrap">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm text-slate-700 dark:text-slate-300">
              {filteredDocuments.length > 0 ? (
                filteredDocuments.map((doc, index) => (
                  <tr
                    key={doc.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    <td className="py-4 px-6 font-semibold text-slate-400 text-center whitespace-nowrap">
                      {index + 1}
                    </td>

                    {/* CỘT TÊN TÀI LIỆU: Max-w-[300px] + Truncate + Tooltip title */}
                    <td className="py-4 px-6 font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 transition-colors whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4 text-indigo-500" />
                        </div>
                        <span
                          className="max-w-[300px] sm:max-w-[380px] truncate font-medium block cursor-help"
                          title={doc.name}
                        >
                          {doc.name}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-center whitespace-nowrap">
                      {getFileBadge(doc.fileType)}
                    </td>

                    <td className="py-4 px-6 font-mono text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {doc.size}
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{doc.uploadedDate}</span>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleDownload(doc)}
                          className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors cursor-pointer"
                          title="Tải xuống/Xem"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(doc.id, doc.name)}
                          className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors cursor-pointer"
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
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-sm whitespace-nowrap">
                    Không tìm thấy tài liệu nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL UPLOAD TÀI LIỆU */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40">
              <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-base flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Tải lên tài liệu mới
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Chọn tập tin tài liệu <span className="text-rose-500">*</span>
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 dark:file:bg-indigo-950/80 file:text-indigo-700 dark:file:text-indigo-300 hover:file:bg-indigo-100 cursor-pointer border border-slate-200 dark:border-slate-700 rounded-xl p-1 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Tên hiển thị tài liệu <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="Ví dụ: Quy chế chuyên môn 2026"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center min-w-[100px]"
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
