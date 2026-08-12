import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import classService from "../../services/classService";
import {
  Users,
  Plus,
  AlertCircle,
  CheckCircle2,
  X
} from "lucide-react";

import ClassTable from "../../components/teacher/class/ClassTable";
import CreateClassModal from "../../components/teacher/class/modals/CreateClassModal";
import DeleteClassConfirmModal from "../../components/teacher/class/modals/DeleteClassConfirmModal";

export default function ClassManagement() {
  const navigate = useNavigate();

  // State danh sách lớp học
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Toast Banner Notification
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', text: '' }

  const showToast = useCallback((text, type = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Modal Tạo lớp
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [className, setClassName] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("Hóa học");
  const [customSubject, setCustomSubject] = useState("");
  const [gradeLevel, setGradeLevel] = useState(12);

  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");

  // Modal Xóa lớp
  const [classToDelete, setClassToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // State sao chép mã
  const [copiedCode, setCopiedCode] = useState(null);

  // 1. Tải danh sách lớp từ Backend (Check isMounted an toàn)
  const fetchMyClasses = useCallback(async (isMounted) => {
    setLoading(true);
    setError("");
    try {
      const data = await classService.getMyClasses();
      if (isMounted()) {
        setClasses(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      if (isMounted()) {
        console.error("Lỗi tải danh sách lớp:", err);
        setError(
          "Không thể kết nối đến máy chủ hoặc bạn chưa đăng nhập hợp lệ."
        );
      }
    } finally {
      if (isMounted()) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const isMounted = () => mounted;

    fetchMyClasses(isMounted);

    return () => {
      mounted = false;
    };
  }, [fetchMyClasses]);

  // 2. Xử lý tạo lớp học
  const handleCreateClass = async (e) => {
    e.preventDefault();
    setModalError("");

    if (!className.trim()) {
      setModalError("Vui lòng nhập tên lớp học.");
      return;
    }

    const finalSubjectName =
      selectedSubject === "OTHER" ? customSubject.trim() : selectedSubject;

    if (!finalSubjectName) {
      setModalError("Vui lòng nhập tên môn học tùy chỉnh.");
      return;
    }

    setSubmitting(true);
    try {
      await classService.createClass({
        name: className.trim(),
        subjectName: finalSubjectName,
        gradeLevel: Number(gradeLevel)
      });

      setClassName("");
      setSelectedSubject("Hóa học");
      setCustomSubject("");
      setGradeLevel(12);
      setIsModalOpen(false);
      showToast("Tạo lớp học mới thành công!");
      fetchMyClasses(() => true);
    } catch (err) {
      console.error("Lỗi tạo lớp:", err);
      setModalError(
        err.response?.data?.message ||
          "Có lỗi xảy ra khi tạo lớp. Vui lòng thử lại."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // 3. Sao chép Join Code 1-click
  const handleCopyCode = (code, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // 4. Xử lý xóa lớp học
  const handleConfirmDeleteClass = async () => {
    if (!classToDelete) return;
    setActionLoading(true);
    try {
      await classService.deleteClass(classToDelete.id);
      setClasses((prev) => prev.filter((c) => c.id !== classToDelete.id));
      showToast(`Đã xóa lớp học "${classToDelete.name}" thành công!`);
      setClassToDelete(null);
    } catch (err) {
      showToast(
        err.response?.data?.message || "Không thể xóa lớp học",
        "error"
      );
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8 font-sans">
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

      {/* Header trang & Nút Tạo lớp */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
          <Users className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
          <span>Quản lý lớp học</span>
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-semibold rounded-xl px-5 py-2.5 flex items-center gap-2 text-sm whitespace-nowrap shadow-sm hover:shadow-md cursor-pointer transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 text-amber-300" />
          <span>Tạo Lớp Học Mới</span>
        </button>
      </div>

      {/* Thông báo lỗi server */}
      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-2xl flex items-center gap-3 text-rose-700 dark:text-rose-400 text-xs sm:text-sm font-medium">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* DANH SÁCH LỚP HỌC DẠNG BẢNG NGANG */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            Đang tải danh sách lớp học...
          </p>
        </div>
      ) : classes.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 flex flex-col items-center py-20 gap-4 shadow-sm">
          <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center border border-indigo-100 dark:border-indigo-800/60 shadow-sm">
            <Users className="w-8 h-8" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
              Bạn chưa tạo lớp học nào
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mt-1">
              Hãy nhấn vào nút <b>"Tạo Lớp Học Mới"</b> để bắt đầu quản lý học sinh và tổ chức kiểm tra.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 text-white font-semibold text-sm rounded-xl inline-flex items-center gap-2 cursor-pointer transition-all shadow-sm active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>Tạo Lớp Ngay</span>
          </button>
        </div>
      ) : (
        <ClassTable
          classes={classes}
          copiedCode={copiedCode}
          onCopyCode={handleCopyCode}
          onViewClass={(classId) => navigate(`/teacher/classes/${classId}`)}
          onOpenDeleteModal={(classItem, e) => {
            e?.stopPropagation();
            setClassToDelete(classItem);
          }}
        />
      )}

      {/* Modal Tạo Lớp Học */}
      <CreateClassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className={className}
        setClassName={setClassName}
        selectedSubject={selectedSubject}
        setSelectedSubject={setSelectedSubject}
        customSubject={customSubject}
        setCustomSubject={setCustomSubject}
        gradeLevel={gradeLevel}
        setGradeLevel={setGradeLevel}
        onSubmit={handleCreateClass}
        submitting={submitting}
        modalError={modalError}
      />

      {/* Modal Xác Nhận Xóa Lớp */}
      <DeleteClassConfirmModal
        classTarget={classToDelete}
        onClose={() => setClassToDelete(null)}
        onConfirmDelete={handleConfirmDeleteClass}
        actionLoading={actionLoading}
      />
    </div>
  );
}
