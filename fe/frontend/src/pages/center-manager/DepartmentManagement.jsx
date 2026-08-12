import React, { useState, useEffect } from "react";
import centerManagerService from "../../services/centerManagerService";
import {
  Plus,
  Edit3,
  Trash2,
  Building2,
  Users,
  Search,
  X,
  CheckCircle2,
  UserCheck,
  RefreshCw,
  AlertCircle
} from "lucide-react";

export default function DepartmentManagement() {
  // State danh sách Tổ chuyên môn & Giáo viên
  const [departments, setDepartments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");

  // Modal State (Thêm mới / Sửa)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);

  // Form State
  const [deptName, setDeptName] = useState("");
  const [selectedHeadId, setSelectedHeadId] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast State
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 3000);
  };

  // Fetch dữ liệu
  const fetchData = async () => {
    setLoading(true);
    try {
      const [deptRes, staffRes] = await Promise.all([
        centerManagerService.getAllDepartments(),
        centerManagerService.getAllStaff()
      ]);
      setDepartments(deptRes?.data || deptRes || []);
      const allStaff = staffRes?.data || staffRes || [];
      setTeachers(allStaff.filter(u => u.role === "TEACHER" || u.role === "DEPARTMENT_HEAD"));
    } catch (error) {
      showToast("Lỗi khi tải dữ liệu từ máy chủ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingDept(null);
    setDeptName("");
    setSelectedHeadId(teachers.length > 0 ? teachers[0].id : "");
    setFormError("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (dept) => {
    setEditingDept(dept);
    setDeptName(dept.name);
    setSelectedHeadId(dept.headId || "");
    setFormError("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
    setEditingDept(null);
    setDeptName("");
    setSelectedHeadId("");
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!deptName.trim()) {
      setFormError("Vui lòng nhập tên Tổ chuyên môn!");
      return;
    }
    if (!selectedHeadId) {
      setFormError("Vui lòng chọn Tổ trưởng!");
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    try {
      if (editingDept) {
        await centerManagerService.updateDepartment(editingDept.id, {
          name: deptName.trim(),
          headId: selectedHeadId ? Number(selectedHeadId) : null
        });
        showToast(`Đã cập nhật thông tin "${deptName.trim()}" thành công!`);
      } else {
        await centerManagerService.createDepartment({
          name: deptName.trim(),
          headId: selectedHeadId ? Number(selectedHeadId) : null
        });
        showToast(`Đã thêm Tổ chuyên môn "${deptName.trim()}" thành công!`);
      }
      handleCloseModal();
      fetchData();
    } catch (error) {
      setFormError(error.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa "${name}" không?`)) {
      try {
        await centerManagerService.deleteDepartment(id);
        showToast(`Đã xóa "${name}" khỏi hệ thống!`);
        fetchData();
      } catch (error) {
        showToast(error.response?.data?.message || "Xóa thất bại!");
      }
    }
  };

  const filteredDepartments = departments.filter(
    (d) =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.headName && d.headName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Toast thông báo */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* HEADER TRANG & NÚT TẠO MỚI */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
          <Building2 className="w-7 h-7 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span className="whitespace-nowrap">Quản lý Tổ chuyên môn</span>
        </h1>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer shadow-xs shrink-0"
            title="Tải lại dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-indigo-500" : ""}`} />
          </button>
          <button
            onClick={handleOpenAddModal}
            className="flex-1 sm:flex-initial bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4 stroke-[3] shrink-0" />
            <span>Thêm Tổ chuyên môn</span>
          </button>
        </div>
      </div>

      {/* THỐNG KÊ NHANH & TÌM KIẾM (TÁCH LÀM 2 HÀNG ĐỘC LẬP CHỐNG NÉN CHỮ) */}
      <div className="space-y-4">
        {/* Hàng 1: Các thẻ Thống kê */}
        <div className="flex flex-wrap items-center gap-4 w-full">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl px-4 py-3 shadow-xs flex items-center gap-3 min-w-[180px]">
            <Building2 className="w-5 h-5 text-indigo-500 shrink-0" />
            <div>
              <p className="text-xs text-slate-400 font-medium whitespace-nowrap">Tổng số Tổ</p>
              <p className="text-xl font-black text-slate-800 dark:text-slate-100">
                {departments.length}
              </p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl px-4 py-3 shadow-xs flex items-center gap-3 min-w-[180px]">
            <Users className="w-5 h-5 text-emerald-500 shrink-0" />
            <div>
              <p className="text-xs text-slate-400 font-medium whitespace-nowrap">Tổng Giáo viên</p>
              <p className="text-xl font-black text-slate-800 dark:text-slate-100">
                {departments.reduce((acc, curr) => acc + (curr.teacherCount || 0), 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Hàng 2: Thanh Tìm kiếm */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 w-full">
          <div className="relative min-w-[280px] flex-1 sm:max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm Tổ hoặc Tổ trưởng..."
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* BẢNG DỮ LIỆU TABLE CHỐNG RỚT DÒNG */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto w-full min-h-[320px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-[320px] gap-3">
              <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
              <p className="text-slate-400 font-medium text-sm">Đang tải dữ liệu tổ chuyên môn...</p>
            </div>
          ) : (
            <table className="w-full text-center border-collapse min-w-[650px]">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6 w-16 text-center whitespace-nowrap">STT</th>
                  <th className="py-4 px-6 text-left whitespace-nowrap">Tên Tổ bộ môn</th>
                  <th className="py-4 px-6 text-left whitespace-nowrap">Tên Tổ trưởng</th>
                  <th className="py-4 px-6 text-center whitespace-nowrap">Số lượng Giáo viên</th>
                  <th className="py-4 px-6 text-center w-32 whitespace-nowrap">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm text-slate-700 dark:text-slate-300">
                {filteredDepartments.length > 0 ? (
                  filteredDepartments.map((dept, index) => (
                    <tr
                      key={dept.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      <td className="py-4 px-6 font-medium text-slate-400 text-center whitespace-nowrap">
                        {index + 1}
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap text-left">
                        <p className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 transition-colors whitespace-nowrap">
                          {dept.name}
                        </p>
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap text-left">
                        <div className="flex justify-start items-center gap-2">
                          <span className="font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                            {dept.headName || "Chưa phân công"}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 whitespace-nowrap">
                          <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>{dept.teacherCount} giáo viên</span>
                        </span>
                      </td>

                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEditModal(dept)}
                            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors cursor-pointer"
                            title="Sửa thông tin"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(dept.id, dept.name)}
                            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors cursor-pointer"
                            title="Xóa Tổ chuyên môn"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-12 text-center text-slate-400 text-sm whitespace-nowrap"
                    >
                      Không tìm thấy Tổ chuyên môn nào phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODAL THÊM MỚI / CHỈNH SỬA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
              <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-base flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                {editingDept ? "Chỉnh sửa Tổ chuyên môn" : "Thêm Tổ chuyên môn mới"}
              </h3>
              <button
                onClick={handleCloseModal}
                disabled={isSubmitting}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Tên Tổ chuyên môn <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  placeholder="Ví dụ: Tổ Toán - Tin"
                  disabled={isSubmitting}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-medium"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Tổ trưởng <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedHeadId}
                  onChange={(e) => setSelectedHeadId(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer font-medium"
                >
                  <option value="" disabled>-- Chọn tổ trưởng --</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.fullName} ({teacher.phoneNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition-all cursor-pointer flex items-center gap-2"
                >
                  {isSubmitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
