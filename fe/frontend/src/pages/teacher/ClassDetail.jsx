import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import classService from "../../services/classService";
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  X
} from "lucide-react";

import ClassHeaderBanner from "../../components/teacher/class/ClassHeaderBanner";
import StudentListTable from "../../components/teacher/class/StudentListTable";
import EditClassNameModal from "../../components/teacher/class/modals/EditClassNameModal";
import RemoveStudentModal from "../../components/teacher/class/modals/RemoveStudentModal";
import PendingStudentList from "../../components/teacher/class/PendingStudentList";

export default function ClassDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // State thông tin lớp và học sinh
  const [classInfo, setClassInfo] = useState(null);
  const [members, setMembers] = useState([]);
  const [pendingMembers, setPendingMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Toast Notification
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', text: '' }

  const showToast = useCallback((text, type = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // State bộ lọc tìm kiếm
  const [searchTerm, setSearchTerm] = useState("");

  // State sao chép mã
  const [copiedCode, setCopiedCode] = useState(null);

  // Modal đổi tên lớp
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const [editError, setEditError] = useState("");

  // Modal xóa học sinh
  const [studentToRemove, setStudentToRemove] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // 1. Lấy dữ liệu chi tiết lớp và danh sách học sinh an toàn
  const fetchClassData = useCallback(async (isMounted) => {
    setLoading(true);
    setError("");
    try {
      const [infoData, membersData, pendingData] = await Promise.all([
        classService.getClassDetails(id),
        classService.getClassMembers(id),
        classService.getPendingMembers(id).catch(() => [])
      ]);

      if (isMounted()) {
        setClassInfo(infoData);
        setNewClassName(infoData?.name || "");
        setMembers(Array.isArray(membersData) ? membersData : []);
        setPendingMembers(Array.isArray(pendingData) ? pendingData : []);
      }
    } catch (err) {
      if (isMounted()) {
        console.error("Lỗi tải chi tiết lớp:", err);
        setError(
          "Không thể tải thông tin lớp học. Lớp không tồn tại hoặc bạn không có quyền truy cập."
        );
      }
    } finally {
      if (isMounted()) {
        setLoading(false);
      }
    }
  }, [id]);

  useEffect(() => {
    let mounted = true;
    const isMounted = () => mounted;

    // Reset state cũ khi đổi ID lớp
    setClassInfo(null);
    setMembers([]);
    if (id) {
      fetchClassData(isMounted);
    }

    return () => {
      mounted = false;
    };
  }, [id, fetchClassData]);

  // 2. Sao chép Join Code
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // 3. Cập nhật tên lớp học
  const handleUpdateClassName = async (e) => {
    e.preventDefault();
    setEditError("");

    if (!newClassName.trim()) {
      setEditError("Tên lớp học không được để trống.");
      return;
    }

    setSubmittingEdit(true);
    try {
      await classService.updateClass(id, {
        name: newClassName.trim(),
        subjectName: classInfo.subjectName,
        gradeLevel: classInfo.gradeLevel
      });

      setClassInfo((prev) => ({ ...prev, name: newClassName.trim() }));
      setIsEditModalOpen(false);
      showToast("Cập nhật tên lớp thành công!");
    } catch (err) {
      setEditError(
        err.response?.data?.message ||
          "Không thể cập nhật tên lớp. Vui lòng thử lại."
      );
    } finally {
      setSubmittingEdit(false);
    }
  };

  // 4. Thực hiện xóa học sinh
  const handleConfirmRemoveStudent = async () => {
    if (!studentToRemove) return;
    const studentId = studentToRemove.studentId || studentToRemove.id;
    setActionLoading(true);
    try {
      await classService.removeMember(id, studentId);
      setMembers((prev) =>
        prev.filter((m) => m.studentId !== studentId && m.id !== studentId)
      );
      showToast(`Đã mời học sinh "${studentToRemove.fullName}" khỏi lớp.`);
      setStudentToRemove(null);
    } catch (err) {
      showToast(
        err.response?.data?.message || "Không thể xóa học sinh",
        "error"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveMember = async (student) => {
    const studentId = student.studentId || student.id;
    setActionLoading(true);
    try {
      await classService.approveMember(id, studentId);
      setPendingMembers(prev => prev.filter(m => (m.studentId || m.id) !== studentId));
      // Thay vì gọi lại API, tạm thời reload lại data
      fetchClassData(() => true);
      showToast(`Đã duyệt học sinh "${student.fullName}" vào lớp.`);
    } catch (err) {
      showToast(err.response?.data?.message || "Lỗi khi duyệt", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectMember = async (student) => {
    const studentId = student.studentId || student.id;
    setActionLoading(true);
    try {
      await classService.rejectMember(id, studentId);
      setPendingMembers(prev => prev.filter(m => (m.studentId || m.id) !== studentId));
      showToast(`Đã từ chối học sinh "${student.fullName}".`);
    } catch (err) {
      showToast(err.response?.data?.message || "Lỗi khi từ chối", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // 5. Lọc học sinh theo từ khóa (Memorized)
  const filteredMembers = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return members;
    return members.filter((m) => {
      const nameMatch = (m.fullName || "").toLowerCase().includes(term);
      const phoneMatch = (m.phoneNumber || "").includes(term);
      return nameMatch || phoneMatch;
    });
  }, [members, searchTerm]);

  return (
    <div className="space-y-8">
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
            className="p-1 hover:bg-black/5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Nút quay lại */}
      <div>
        <button
          onClick={() => navigate("/teacher/classes")}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 hover:text-teal-600 font-semibold text-sm transition-all shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại Danh sách lớp</span>
        </button>
      </div>

      {/* Thông báo lỗi */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-600 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="py-24 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-slate-500 font-medium">
            Đang tải dữ liệu lớp học và danh sách học sinh...
          </p>
        </div>
      ) : !classInfo ? null : (
        <>
          {/* Banner Thông tin Lớp học */}
          <ClassHeaderBanner
            classInfo={classInfo}
            memberCount={members.length}
            copiedCode={copiedCode}
            onCopyCode={handleCopyCode}
            onOpenEditModal={() => {
              setNewClassName(classInfo.name);
              setIsEditModalOpen(true);
            }}
          />

          <PendingStudentList 
            pendingMembers={pendingMembers}
            onApprove={handleApproveMember}
            onReject={handleRejectMember}
            actionLoading={actionLoading}
          />

          {/* Bảng Danh sách Học sinh */}
          <StudentListTable
            members={members}
            filteredMembers={filteredMembers}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            joinCode={classInfo.joinCode}
            onOpenRemoveModal={(student) => setStudentToRemove(student)}
          />
        </>
      )}

      {/* Modal Đổi Tên Lớp */}
      <EditClassNameModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        newClassName={newClassName}
        setNewClassName={setNewClassName}
        onSubmit={handleUpdateClassName}
        submittingEdit={submittingEdit}
        editError={editError}
      />

      {/* Modal Xác Nhận Xóa Học Sinh */}
      <RemoveStudentModal
        studentTarget={studentToRemove}
        onClose={() => setStudentToRemove(null)}
        onConfirmRemove={handleConfirmRemoveStudent}
        actionLoading={actionLoading}
      />
    </div>
  );
}
