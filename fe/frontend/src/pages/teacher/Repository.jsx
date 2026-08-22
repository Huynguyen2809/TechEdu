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
  X
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

  // Fetch dữ liệu kho tài liệu
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

  useEffect(() => {
    fetchContent(currentFolderId);
  }, [currentFolderId, fetchContent]);

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
          <Folder className="w-7 h-7 text-teal-600 dark:text-teal-400" />
          <span>Ngân hàng đề thi</span>
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsFolderModalOpen(true)}
            className={`${BTN_SECONDARY} px-5 py-2.5 flex items-center gap-2 text-sm whitespace-nowrap`}
          >
            <FolderPlus className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Tạo Thư Mục</span>
          </button>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className={`${BTN_PRIMARY} px-5 py-2.5 flex items-center gap-2 text-sm whitespace-nowrap`}
          >
            <UploadCloud className="w-4 h-4 text-amber-300" />
            <span>Tải File PDF</span>
          </button>
        </div>
      </div>

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
        onOpenMoveModal={handleOpenMoveModal}
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
