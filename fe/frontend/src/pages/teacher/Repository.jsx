import React, { useState, useEffect, useMemo, useCallback } from "react";
import repositoryService from "../../services/repositoryService";
import {
  Folder,
  FolderPlus,
  UploadCloud,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  X,
  Building2,
  FileText,
  FileSpreadsheet,
  File,
  Download,
  Eye,
  Calendar,
  Layers,
  Sparkles,
  BookOpen
} from "lucide-react";

import RepositoryBreadcrumb from "../../components/teacher/repository/RepositoryBreadcrumb";
import RepositoryContextMenu from "../../components/teacher/repository/RepositoryContextMenu";
import RepositoryTable from "../../components/teacher/repository/RepositoryTable";

import CreateFolderModal from "../../components/teacher/repository/modals/CreateFolderModal";
import UploadModal from "../../components/teacher/repository/modals/UploadModal";
import PdfPreviewModal from "../../components/teacher/repository/modals/PdfPreviewModal";
import MoveDocumentModal from "../../components/teacher/repository/modals/MoveDocumentModal";
import RenameModal from "../../components/teacher/repository/modals/RenameModal";
import DeleteConfirmModal from "../../components/teacher/repository/modals/DeleteConfirmModal";

// ── Shared tri-theme tokens ──────────────────────────────────────
const BTN_PRIMARY =
  "bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white font-semibold rounded-xl border border-transparent shadow-sm active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2";
const BTN_SECONDARY =
  "bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2";

export default function Repository() {
  // Tab State: 'MY_DOCS' | 'SHARED_DOCS'
  const [activeTab, setActiveTab] = useState("MY_DOCS");

  // ── State cho Tab Tài liệu của tôi ──
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [folderHistory, setFolderHistory] = useState([
    { id: null, name: "Gốc" }
  ]);

  const [folders, setFolders] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("ALL"); // ALL | EXAM | EXPLANATION

  // ── State cho Tab Tài liệu dùng chung bộ môn ──
  const [sharedDocs, setSharedDocs] = useState([]);
  const [deptName, setDeptName] = useState("");
  const [deptId, setDeptId] = useState(null);
  const [sharedLoading, setSharedLoading] = useState(false);
  const [sharedSearchTerm, setSharedSearchTerm] = useState("");
  const [sharedFilterFormat, setSharedFilterFormat] = useState("ALL");

  // Toast Banner Notification
  const [toast, setToast] = useState(null); // { type: 'success'|'error', text: '' }

  const showToast = useCallback((text, type = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Modals state
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // States cho Di chuyển File
  const [moveDocTarget, setMoveDocTarget] = useState(null);
  const [allFoldersList, setAllFoldersList] = useState([]);
  const [selectedTargetFolderId, setSelectedTargetFolderId] = useState("");

  // States cho Context Menu, Đổi tên, Xóa
  const [contextMenu, setContextMenu] = useState(null);
  const [renameItemTarget, setRenameItemTarget] = useState(null);
  const [deleteItemTarget, setDeleteItemTarget] = useState(null);

  const [newFolderName, setNewFolderName] = useState("");
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadFileType, setUploadFileType] = useState("EXAM");
  const [actionLoading, setActionLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Đóng Context Menu khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  // Fetch dữ liệu kho tài liệu cá nhân
  const fetchContent = useCallback(async (folderId) => {
    setLoading(true);
    setError("");
    try {
      const data = await repositoryService.getContent(folderId);
      setFolders(data.folders || []);
      setDocuments(data.documents || []);
    } catch (err) {
      setError("Không thể tải dữ liệu kho tài liệu.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch dữ liệu tài liệu dùng chung bộ môn
  const fetchSharedContent = useCallback(async () => {
    setSharedLoading(true);
    try {
      const data = await repositoryService.getSharedDepartmentDocuments();
      setSharedDocs(data.documents || []);
      setDeptName(data.departmentName || "Chưa phân tổ");
      setDeptId(data.departmentId || null);
    } catch (err) {
      console.error("Lỗi khi tải tài liệu dùng chung:", err);
    } finally {
      setSharedLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "MY_DOCS") {
      fetchContent(currentFolderId);
    } else {
      fetchSharedContent();
    }
  }, [activeTab, currentFolderId, fetchContent, fetchSharedContent]);

  // Lọc và Tìm kiếm dữ liệu (Memorized)
  const filteredFolders = useMemo(() => {
    if (filterType !== "ALL") return [];
    if (!searchTerm.trim()) return folders;
    return folders.filter((f) =>
      (f.name || "").toLowerCase().includes(searchTerm.toLowerCase().trim())
    );
  }, [folders, searchTerm, filterType]);

  const filteredDocuments = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return documents.filter((doc) => {
      const nameToMatch = (doc.title || doc.fileName || doc.name || "")
        .toLowerCase();
      const titleMatches = !term || nameToMatch.includes(term);

      const typeStr = (doc.fileType || doc.type || doc.documentType || "")
        .toString()
        .toUpperCase();

      const isExam = typeStr === "EXAM";
      const isExplanation = typeStr === "EXPLANATION";

      if (!titleMatches) return false;
      if (filterType === "EXAM") return isExam;
      if (filterType === "EXPLANATION") return isExplanation || (!isExam && typeStr !== "EXAM");
      return true;
    });
  }, [documents, searchTerm, filterType]);

  // Modals & Action Handlers
  const handleOpenMoveModal = async (doc, e) => {
    e?.stopPropagation();
    setMoveDocTarget(doc);
    setSelectedTargetFolderId("");
    try {
      const data = await repositoryService.getAllFolders();
      setAllFoldersList(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast("Lỗi khi tải danh sách thư mục", "error");
    }
  };

  const handleMoveDocument = async (docId, targetFolderId) => {
    setActionLoading(true);
    try {
      await repositoryService.moveDocument(docId, targetFolderId);
      setMoveDocTarget(null);
      if (selectedDoc?.id === docId) setSelectedDoc(null);
      showToast("Di chuyển tài liệu thành công!");
      fetchContent(currentFolderId);
    } catch (err) {
      showToast(err.response?.data?.message || "Lỗi khi di chuyển file", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleContextMenu = (e, item, itemType) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      item,
      itemType
    });
  };

  const handleOpenRenameModal = (item, itemType, e) => {
    e?.stopPropagation();
    setRenameItemTarget({
      item,
      itemType,
      newName: item.title || item.name || ""
    });
  };

  const handleRenameSubmit = async (e) => {
    e.preventDefault();
    if (!renameItemTarget || !renameItemTarget.newName.trim()) return;
    setActionLoading(true);
    try {
      if (renameItemTarget.itemType === "FILE") {
        await repositoryService.renameDocument(
          renameItemTarget.item.id,
          renameItemTarget.newName.trim()
        );
      } else {
        await repositoryService.renameFolder(
          renameItemTarget.item.id,
          renameItemTarget.newName.trim()
        );
      }
      setRenameItemTarget(null);
      showToast("Đổi tên thành công!");
      fetchContent(currentFolderId);
    } catch (err) {
      showToast(err.response?.data?.message || "Lỗi khi đổi tên", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenDeleteModal = (item, itemType, e) => {
    e?.stopPropagation();
    setDeleteItemTarget({ item, itemType });
  };

  const handleDeleteSubmit = async () => {
    if (!deleteItemTarget) return;
    setActionLoading(true);
    try {
      if (deleteItemTarget.itemType === "FILE") {
        await repositoryService.deleteDocument(deleteItemTarget.item.id);
        if (selectedDoc?.id === deleteItemTarget.item.id) setSelectedDoc(null);
      } else {
        await repositoryService.deleteFolder(deleteItemTarget.item.id);
      }
      setDeleteItemTarget(null);
      showToast("Đã xóa tài nguyên thành công!");
      fetchContent(currentFolderId);
    } catch (err) {
      showToast(err.response?.data?.message || "Lỗi khi xóa tài nguyên", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleFileType = async (doc, e) => {
    e?.stopPropagation();
    setActionLoading(true);
    try {
      await repositoryService.toggleFileType(doc.id);
      showToast("Đã chuyển đổi loại tài liệu!");
      fetchContent(currentFolderId);
    } catch (err) {
      showToast(err.response?.data?.message || "Lỗi khi đổi loại file", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenFolder = (folder) => {
    setCurrentFolderId(folder.id);
    setFolderHistory((prev) => [...prev, { id: folder.id, name: folder.name }]);
  };

  const handleNavigateBreadcrumb = (index) => {
    const newHistory = folderHistory.slice(0, index + 1);
    setFolderHistory(newHistory);
    setCurrentFolderId(newHistory[newHistory.length - 1].id);
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    setActionLoading(true);
    try {
      await repositoryService.createFolder(
        newFolderName.trim(),
        currentFolderId
      );
      setNewFolderName("");
      setIsFolderModalOpen(false);
      showToast("Tạo thư mục mới thành công!");
      fetchContent(currentFolderId);
    } catch (err) {
      showToast(err.response?.data?.message || "Lỗi khi tạo thư mục", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUploadFile = async (e) => {
    e?.preventDefault();
    if (!uploadFile) return;
    setActionLoading(true);
    try {
      await repositoryService.uploadDocument(
        uploadFile,
        uploadFileType,
        currentFolderId
      );
      setUploadFile(null);
      setIsUploadModalOpen(false);
      showToast("Tải lên file PDF thành công!");
      fetchContent(currentFolderId);
    } catch (err) {
      showToast(err.response?.data?.message || "Lỗi khi tải file lên", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        setUploadFile(file);
        setIsUploadModalOpen(true);
      } else {
        showToast("Chỉ chấp nhận file định dạng PDF (.pdf)", "error");
      }
    }
  };

  // Lọc tài liệu dùng chung bộ môn
  const filteredSharedDocuments = useMemo(() => {
    const term = sharedSearchTerm.toLowerCase().trim();
    return sharedDocs.filter((doc) => {
      const nameMatches =
        !term ||
        (doc.title || "").toLowerCase().includes(term) ||
        (doc.uploadedBy || "").toLowerCase().includes(term) ||
        (doc.departmentName || "").toLowerCase().includes(term);

      const formatMatches =
        sharedFilterFormat === "ALL" ||
        (doc.format || "").toUpperCase() === sharedFilterFormat.toUpperCase();

      return nameMatches && formatMatches;
    });
  }, [sharedDocs, sharedSearchTerm, sharedFilterFormat]);

  const getFormatBadge = (format) => {
    switch (format?.toUpperCase()) {
      case "PDF":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black bg-rose-50 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/60">
            <FileText className="w-3.5 h-3.5" />
            PDF
          </span>
        );
      case "DOCX":
      case "DOC":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
            <FileText className="w-3.5 h-3.5" />
            WORD
          </span>
        );
      case "XLSX":
      case "XLS":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            EXCEL
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
            <File className="w-3.5 h-3.5" />
            {format || "FILE"}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 font-sans" onDragEnter={handleDrag}>
      {/* Toast Notification Banner */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 animate-in slide-in-from-top-3 duration-200 ${
            toast.type === "error"
              ? "bg-rose-50 dark:bg-rose-950 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-800"
              : "bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800"
          }`}
        >
          {toast.type === "error" ? (
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          )}
          <span className="text-xs font-bold">{toast.text}</span>
          <button
            onClick={() => setToast(null)}
            className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header trang & Nút hành động */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 md:p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-teal-50 dark:bg-teal-900/40 rounded-xl text-teal-600 dark:text-teal-400">
              <Folder className="w-6 h-6 shrink-0" />
            </div>
            <span>Kho Tài liệu & Ngân hàng đề thi</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Quản lý đề thi cá nhân và tiếp cận tài liệu dùng chung từ Tổ chuyên môn
          </p>
        </div>

        {activeTab === "MY_DOCS" && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsFolderModalOpen(true)}
              className={`${BTN_SECONDARY} px-4 py-2.5 flex items-center gap-2 text-xs font-bold whitespace-nowrap`}
            >
              <FolderPlus className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Tạo Thư Mục</span>
            </button>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className={`${BTN_PRIMARY} px-4 py-2.5 flex items-center gap-2 text-xs font-bold whitespace-nowrap`}
            >
              <UploadCloud className="w-4 h-4 text-amber-300" />
              <span>Tải File PDF</span>
            </button>
          </div>
        )}
      </div>

      {/* TAB NAVIGATION: TÀI LIỆU CỦA TÔI / TÀI LIỆU DÙNG CHUNG BỘ MÔN */}
      <div className="flex items-center gap-3 border-b border-slate-200/80 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("MY_DOCS")}
          className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-extrabold text-sm transition-all cursor-pointer ${
            activeTab === "MY_DOCS"
              ? "bg-teal-600 text-white shadow-lg shadow-teal-500/25 scale-[1.02]"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200/60 dark:border-slate-800"
          }`}
        >
          <Folder className="w-4 h-4" />
          <span>Tài liệu của tôi</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeTab === "MY_DOCS"
                ? "bg-teal-700 text-teal-100"
                : "bg-slate-100 dark:bg-slate-800 text-slate-500"
            }`}
          >
            {documents.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("SHARED_DOCS")}
          className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-extrabold text-sm transition-all cursor-pointer ${
            activeTab === "SHARED_DOCS"
              ? "bg-teal-600 text-white shadow-lg shadow-teal-500/25 scale-[1.02]"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200/60 dark:border-slate-800"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Tài liệu dùng chung bộ môn</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeTab === "SHARED_DOCS"
                ? "bg-teal-700 text-teal-100"
                : "bg-slate-100 dark:bg-slate-800 text-slate-500"
            }`}
          >
            {sharedDocs.length}
          </span>
        </button>
      </div>

      {/* NỘI DUNG TAB 1: TÀI LIỆU CỦA TÔI */}
      {activeTab === "MY_DOCS" && (
        <div className="space-y-5 animate-in fade-in duration-300">
          {/* BREADCRUMB ĐƯỜNG DẪN THƯ MỤC */}
          <RepositoryBreadcrumb
            folderHistory={folderHistory}
            onNavigate={handleNavigateBreadcrumb}
          />

          {/* THANH TÌM KIẾM & BỘ LỌC TÀI LIỆU */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
            {/* Ô Tìm kiếm */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm tài liệu, thư mục..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-xl focus:outline-none focus:border-teal-500 font-semibold text-slate-800 dark:text-slate-100 shadow-sm transition-all focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-teal-500/10"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Bộ lọc loại file */}
            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              <Filter className="w-4 h-4 text-slate-400 mr-1 shrink-0" />
              <button
                onClick={() => setFilterType("ALL")}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors whitespace-nowrap shadow-sm active:scale-95 ${
                  filterType === "ALL"
                    ? "bg-teal-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setFilterType("EXAM")}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors whitespace-nowrap shadow-sm active:scale-95 ${
                  filterType === "EXAM"
                    ? "bg-rose-500 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                Đề Thi PDF
              </button>
              <button
                onClick={() => setFilterType("EXPLANATION")}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors whitespace-nowrap shadow-sm active:scale-95 ${
                  filterType === "EXPLANATION"
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                Lời Giải
              </button>
            </div>
          </div>

          {/* WORKSPACE BẢNG HIỂN THỊ THƯ MỤC & FILE */}
          <RepositoryTable
            folders={filteredFolders}
            documents={filteredDocuments}
            loading={loading}
            error={error}
            dragActive={dragActive}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onOpenFolder={handleOpenFolder}
            onSelectDoc={setSelectedDoc}
            onContextMenu={handleContextMenu}
            onToggleFileType={handleToggleFileType}
            onMoveDocument={handleMoveDocument}
            onOpenUploadModal={() => setIsUploadModalOpen(true)}
            btnPrimary={BTN_PRIMARY}
          />
        </div>
      )}

      {/* NỘI DUNG TAB 2: TÀI LIỆU DÙNG CHUNG BỘ MÔN */}
      {activeTab === "SHARED_DOCS" && (
        <div className="space-y-5 animate-in fade-in duration-300">
          {/* BANNER THÔNG TIN BỘ MÔN (Tone Xanh Ngọc - Teal) */}
          <div className="bg-gradient-to-r from-teal-500/10 via-emerald-500/5 to-transparent dark:from-teal-900/30 rounded-3xl p-5 md:p-6 border border-teal-200/80 dark:border-teal-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-black shadow-md shadow-teal-500/20 shrink-0">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                    Tổ chuyên môn của bạn
                  </span>
                  <span className="bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-800">
                    Chính thức
                  </span>
                </div>
                <h2 className="text-lg md:text-xl font-black text-slate-900 dark:text-slate-100 mt-0.5">
                  {deptName}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Bạn có quyền xem và tải về các tài liệu biểu mẫu, đề cương do Quản lý trung tâm ban hành cho tổ bộ môn này.
                </p>
              </div>
            </div>

            <button
              onClick={fetchSharedContent}
              disabled={sharedLoading}
              className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-slate-800 transition-colors shadow-sm shrink-0 cursor-pointer"
            >
              Làm mới danh sách
            </button>
          </div>

          {/* THANH TÌM KIẾM & BỘ LỌC TÀI LIỆU DÙNG CHUNG */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={sharedSearchTerm}
                onChange={(e) => setSharedSearchTerm(e.target.value)}
                placeholder="Tìm kiếm tài liệu dùng chung..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-xl focus:outline-none focus:border-teal-500 font-semibold text-slate-800 dark:text-slate-100 shadow-sm transition-all focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-teal-500/10"
              />
              {sharedSearchTerm && (
                <button
                  onClick={() => setSharedSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              <Filter className="w-4 h-4 text-slate-400 mr-1 shrink-0" />
              {["ALL", "PDF", "DOCX", "XLSX"].map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setSharedFilterFormat(fmt)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors whitespace-nowrap shadow-sm active:scale-95 ${
                    sharedFilterFormat === fmt
                      ? "bg-teal-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {fmt === "ALL" ? "Tất cả định dạng" : fmt}
                </button>
              ))}
            </div>
          </div>

          {/* BẢNG TÀI LIỆU DÙNG CHUNG */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm overflow-hidden min-h-[350px]">
            {sharedLoading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <div className="w-9 h-9 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
                <p className="text-xs font-bold text-slate-400">Đang tải tài liệu dùng chung bộ môn...</p>
              </div>
            ) : filteredSharedDocuments.length > 0 ? (
              <div className="overflow-x-auto w-full">
                <table className="w-full text-center border-collapse min-w-[750px]">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200/60 dark:border-slate-800/60 text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <th className="py-4 px-6 w-16 text-center whitespace-nowrap">STT</th>
                      <th className="py-4 px-6 text-left whitespace-nowrap">Tên tài liệu</th>
                      <th className="py-4 px-6 text-center whitespace-nowrap">Định dạng</th>
                      <th className="py-4 px-6 text-center whitespace-nowrap">Dung lượng</th>
                      <th className="py-4 px-6 text-center whitespace-nowrap">Phạm vi</th>
                      <th className="py-4 px-6 text-center whitespace-nowrap">Ngày đăng</th>
                      <th className="py-4 px-6 text-center w-36 whitespace-nowrap">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
                    {filteredSharedDocuments.map((doc, idx) => (
                      <tr
                        key={doc.id}
                        onDoubleClick={() => {
                          if (
                            doc.format?.toUpperCase() === "PDF" ||
                            doc.fileUrl?.toLowerCase().includes(".pdf") ||
                            doc.fileUrl?.includes("/api/v1/repository/documents/view/")
                          ) {
                            setSelectedDoc(doc);
                          } else if (doc.fileUrl) {
                            window.open(`http://localhost:8080${doc.fileUrl}`, "_blank");
                          }
                        }}
                        className="hover:bg-teal-50/40 dark:hover:bg-teal-950/20 transition-colors group cursor-pointer select-none"
                        title="Double click để xem tài liệu"
                      >
                        <td className="py-4 px-6 font-bold text-slate-400 text-center whitespace-nowrap">
                          {idx + 1}
                        </td>
                        <td className="py-4 px-6 text-left whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 border border-teal-100 dark:border-teal-800/60">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors max-w-[280px] truncate">
                                {doc.title}
                              </p>
                              <span className="text-[10px] text-slate-400">
                                Người đăng: {doc.uploadedBy || "Quản Lý Trung Tâm"}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center whitespace-nowrap">
                          {getFormatBadge(doc.format)}
                        </td>
                        <td className="py-4 px-6 text-center font-mono text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {doc.size}
                        </td>
                        <td className="py-4 px-6 text-center whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/60">
                            {doc.departmentName || deptName}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center text-xs font-semibold text-slate-500 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{doc.uploadedDate}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            {doc.format?.toUpperCase() === "PDF" && (
                              <button
                                onClick={() => setSelectedDoc(doc)}
                                className="p-2 rounded-xl text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-colors cursor-pointer border border-transparent hover:border-teal-200"
                                title="Xem trước PDF"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            )}
                            <a
                              href={`http://localhost:8080${doc.fileUrl}`}
                              target="_blank"
                              rel="noreferrer"
                              download
                              className="p-2 rounded-xl text-slate-500 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-colors cursor-pointer border border-transparent hover:border-teal-200"
                              title="Tải về máy"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-24 text-center space-y-3">
                <Building2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                  Chưa có tài liệu dùng chung nào cho {deptName}.
                </p>
                <p className="text-xs text-slate-400">
                  Khi Quản lý trung tâm tải lên tài liệu thuộc tổ {deptName}, tài liệu sẽ xuất hiện tại đây.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CONTEXT MENU */}
      <RepositoryContextMenu
        contextMenu={contextMenu}
        onClose={() => setContextMenu(null)}
        onOpenFolderModal={() => setIsFolderModalOpen(true)}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        onRefresh={() => fetchContent(currentFolderId)}
        onSelectDoc={setSelectedDoc}
        onToggleFileType={handleToggleFileType}
        onOpenMoveModal={handleOpenMoveModal}
        onOpenFolder={handleOpenFolder}
        onOpenRenameModal={handleOpenRenameModal}
        onOpenDeleteModal={handleOpenDeleteModal}
      />

      {/* MODALS */}
      <CreateFolderModal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
        newFolderName={newFolderName}
        setNewFolderName={setNewFolderName}
        onSubmit={handleCreateFolder}
        actionLoading={actionLoading}
        btnPrimary={BTN_PRIMARY}
        btnSecondary={BTN_SECONDARY}
      />

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        uploadFile={uploadFile}
        setUploadFile={setUploadFile}
        uploadFileType={uploadFileType}
        setUploadFileType={setUploadFileType}
        onUploadSubmit={handleUploadFile}
        actionLoading={actionLoading}
        btnPrimary={BTN_PRIMARY}
        btnSecondary={BTN_SECONDARY}
      />

      <PdfPreviewModal
        selectedDoc={selectedDoc}
        onClose={() => setSelectedDoc(null)}
      />

      <MoveDocumentModal
        moveDocTarget={moveDocTarget}
        onClose={() => setMoveDocTarget(null)}
        allFoldersList={allFoldersList}
        selectedTargetFolderId={selectedTargetFolderId}
        setSelectedTargetFolderId={setSelectedTargetFolderId}
        onMoveSubmit={handleMoveDocument}
        actionLoading={actionLoading}
        btnPrimary={BTN_PRIMARY}
        btnSecondary={BTN_SECONDARY}
      />

      <RenameModal
        renameItemTarget={renameItemTarget}
        setRenameItemTarget={setRenameItemTarget}
        onClose={() => setRenameItemTarget(null)}
        onSubmit={handleRenameSubmit}
        actionLoading={actionLoading}
        btnPrimary={BTN_PRIMARY}
        btnSecondary={BTN_SECONDARY}
      />

      <DeleteConfirmModal
        deleteItemTarget={deleteItemTarget}
        onClose={() => setDeleteItemTarget(null)}
        onDeleteSubmit={handleDeleteSubmit}
        actionLoading={actionLoading}
        btnSecondary={BTN_SECONDARY}
      />
    </div>
  );
}
