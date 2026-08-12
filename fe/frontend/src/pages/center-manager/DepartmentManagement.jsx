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
    <div className="space-y-6 font-sans animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Toast thông báo */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600/90 backdrop-blur-md border border-emerald-400 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* HEADER TRANG & NÚT TẠO MỚI */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 md:p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
        <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-3">
          <div className="p-2.5 bg-purple-50 dark:bg-purple-900/40 rounded-xl text-purple-600 dark:text-purple-400">
            <Building2 className="w-6 h-6 shrink-0" />
          </div>
          Quản lý Tổ chuyên môn
        </h1>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:border-purple-300 dark:hover:border-purple-700 transition-all cursor-pointer shadow-sm active:scale-95 shrink-0"
            title="Tải lại dữ liệu"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin text-purple-500" : ""}`} />
          </button>
          <button
            onClick={handleOpenAddModal}
            className="flex-1 sm:flex-initial bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-bold px-5 py-3 rounded-xl shadow-md shadow-purple-500/20 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer whitespace-nowrap active:scale-95 border border-purple-500/30"
          >
            <Plus className="w-5 h-5 stroke-[3] shrink-0" />
            Thêm Tổ chuyên môn
          </button>
        </div>
      </div>

      {/* THỐNG KÊ NHANH & TÌM KIẾM */}
      <div className="space-y-5">
        {/* Hàng 1: Các thẻ Thống kê */}
        <div className="flex flex-wrap items-center gap-4 w-full">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-5 shadow-sm flex items-center gap-4 min-w-[220px]">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/40 rounded-xl text-indigo-600 dark:text-indigo-400">
              <Building2 className="w-6 h-6 shrink-0" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider mb-1">Tổng số Tổ</p>
              <p className="text-2xl font-black text-slate-900 dark:text-slate-100 leading-none">
                {departments.length}
              </p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-5 shadow-sm flex items-center gap-4 min-w-[220px]">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/40 rounded-xl text-emerald-600 dark:text-emerald-400">
              <Users className="w-6 h-6 shrink-0" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider mb-1">Tổng Giáo viên</p>
              <p className="text-2xl font-black text-slate-900 dark:text-slate-100 leading-none">
                {departments.reduce((acc, curr) => acc + (curr.teacherCount || 0), 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Hàng 2: Thanh Tìm kiếm */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 w-full bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
          <div className="relative min-w-[280px] w-full sm:max-w-md">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm Tổ hoặc Tổ trưởng..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* BẢNG DỮ LIỆU TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full min-h-[320px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-[320px] gap-3">
              <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-xl">
                <RefreshCw className="w-8 h-8 text-purple-600 dark:text-purple-400 animate-spin" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">Đang tải dữ liệu tổ chuyên môn...</p>
            </div>
          ) : (
            <table className="w-full text-center border-collapse min-w-[650px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200/60 dark:border-slate-800/60 text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6 w-16 text-center whitespace-nowrap">STT</th>
                  <th className="py-4 px-6 text-left whitespace-nowrap">Tên Tổ bộ môn</th>
                  <th className="py-4 px-6 text-left whitespace-nowrap">Tên Tổ trưởng</th>
                  <th className="py-4 px-6 text-center whitespace-nowrap">Số lượng Giáo viên</th>
                  <th className="py-4 px-6 text-center w-32 whitespace-nowrap">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
                {filteredDepartments.length > 0 ? (
                  filteredDepartments.map((dept, index) => (
                    <tr
                      key={dept.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    >
                      <td className="py-4 px-6 font-bold text-slate-400 dark:text-slate-500 text-center whitespace-nowrap">
                        {index + 1}
                      </td>

                      <td className="py-4 px-6 text-left whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-900/40 flex items-center justify-center text-purple-600 dark:text-purple-400">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <p className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                            {dept.name}
                          </p>
                        </div>
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap text-left">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg text-sm border border-slate-200/60 dark:border-slate-700/60">
                          {dept.headName || "Chưa phân công"}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
                          <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>{dept.teacherCount} giáo viên</span>
                        </span>
                      </td>

                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEditModal(dept)}
                            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors cursor-pointer border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800/60"
                            title="Sửa thông tin"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(dept.id, dept.name)}
                            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors cursor-pointer border border-transparent hover:border-rose-200 dark:hover:border-rose-800/60"
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
                      className="py-16 text-center whitespace-nowrap"
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Building2 className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                        <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">Không tìm thấy Tổ chuyên môn nào phù hợp.</p>
                      </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/60 dark:border-slate-800/60 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="font-black text-slate-900 dark:text-slate-100 text-lg flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-xl text-purple-600 dark:text-purple-400">
                  <Building2 className="w-5 h-5" />
                </div>
                {editingDept ? "Chỉnh sửa Tổ chuyên môn" : "Thêm Tổ chuyên môn"}
              </h3>
              <button
                onClick={handleCloseModal}
                disabled={isSubmitting}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {formError && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {formError}
                </div>
              )}

              <div className="space-y-4">
                <div className="group">
                  <label className="block text-xs font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2 group-focus-within:text-purple-600 transition-colors">
                    <Building2 className="w-4 h-4 text-slate-400 group-focus-within:text-purple-500" />
                    Tên Tổ chuyên môn <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={deptName}
                    onChange={(e) => setDeptName(e.target.value)}
                    placeholder="Ví dụ: Tổ Toán - Tin"
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 font-bold transition-all"
                    autoFocus
                  />
                </div>

                <div className="group">
                  <label className="block text-xs font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2 group-focus-within:text-purple-600 transition-colors">
                    <UserCheck className="w-4 h-4 text-slate-400 group-focus-within:text-purple-500" />
                    Tổ trưởng <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={selectedHeadId}
                    onChange={(e) => setSelectedHeadId(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 cursor-pointer font-bold transition-all"
                  >
                    <option value="" disabled>-- Chọn tổ trưởng --</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.fullName} ({teacher.phoneNumber})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-6 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800/60">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md shadow-purple-500/20 transition-all cursor-pointer flex items-center gap-2 active:scale-95 border border-purple-500/30"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
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
