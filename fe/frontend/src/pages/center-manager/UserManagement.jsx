import React, { useState, useEffect } from "react";
import centerManagerService from "../../services/centerManagerService";
import {
  Users,
  Plus,
  Key,
  Edit3,
  Lock,
  Unlock,
  Search,
  X,
  CheckCircle2,
  Award,
  Shield,
  Info,
  Phone,
  User,
  AlertCircle,
  RefreshCw,
  Building2
} from "lucide-react";

// Helper hiển thị Role Badge
function RoleBadge({ role }) {
  if (role === "DEPARTMENT_HEAD") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800/60 whitespace-nowrap shadow-sm">
        <Shield className="w-3.5 h-3.5 shrink-0" />
        <span>Tổ trưởng</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 whitespace-nowrap shadow-sm">
      <Award className="w-3.5 h-3.5 shrink-0" />
      <span>Giáo viên</span>
    </span>
  );
}

// Helper hiển thị Status Badge
function StatusBadge({ isActive }) {
  return isActive ? (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 whitespace-nowrap shadow-sm">
      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
      <span>Hoạt động</span>
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/60 whitespace-nowrap shadow-sm">
      <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
      <span>Đã khóa</span>
    </span>
  );
}

export default function UserManagement() {
  // State danh sách Nhân sự từ API
  const [users, setUsers] = useState([]);
  const [departmentsList, setDepartmentsList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  // State Modal (Cấp phát / Sửa)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // State Modal Confirm Reset Mật khẩu
  const [resetConfirmUser, setResetConfirmUser] = useState(null);

  // State Modal Chi tiết
  const [detailUser, setDetailUser] = useState(null);

  // Form State
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast State
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3500);
  };

  // Fetch dữ liệu từ API
  const fetchStaffData = async () => {
    setLoading(true);
    try {
      const [staffRes, deptRes] = await Promise.all([
        centerManagerService.getAllStaff(),
        centerManagerService.getAllDepartments()
      ]);
      setUsers(staffRes?.data || staffRes || []);
      setDepartmentsList(deptRes?.data || deptRes || []);
    } catch (error) {
      showToast("Lỗi khi tải danh sách nhân sự", "warning");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFullName("");
    setPhoneNumber("");
    setDepartmentId(departmentsList.length > 0 ? departmentsList[0].id : "");
    setFormError("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setEditingUser(user);
    setFullName(user.fullName);
    setPhoneNumber(user.phoneNumber);
    setDepartmentId(user.departmentId || "");
    setFormError("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
    setEditingUser(null);
    setFullName("");
    setPhoneNumber("");
    setDepartmentId("");
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setFormError("Vui lòng nhập Họ và Tên!");
      return;
    }
    if (!editingUser) {
      if (!phoneNumber.trim()) {
        setFormError("Vui lòng nhập Số điện thoại!");
        return;
      }
      const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
      if (!phoneRegex.test(phoneNumber.trim())) {
        setFormError("Số điện thoại không hợp lệ! Vui lòng nhập đúng dạng 10 chữ số.");
        return;
      }
    }

    setIsSubmitting(true);
    setFormError("");

    try {
      if (editingUser) {
        await centerManagerService.updateStaff(editingUser.id, {
          fullName: fullName.trim(),
          departmentId: Number(departmentId)
        });
        showToast(`Đã cập nhật thông tin nhân sự "${fullName.trim()}" thành công!`);
      } else {
        await centerManagerService.createStaff({
          fullName: fullName.trim(),
          phoneNumber: phoneNumber.trim(),
          departmentId: Number(departmentId)
        });
        showToast(`Cấp phát tài khoản cho "${fullName.trim()}" thành công! Mật khẩu mặc định: 123456`);
      }
      handleCloseModal();
      fetchStaffData();
    } catch (error) {
      setFormError(error.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại sau!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await centerManagerService.toggleStaffStatus(user.id);
      const nextStatus = !user.isActive;
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isActive: nextStatus } : u))
      );
      if (nextStatus) {
        showToast(`Đã kích hoạt lại tài khoản của "${user.fullName}"!`, "success");
      } else {
        showToast(`Đã khóa tài khoản của "${user.fullName}"!`, "warning");
      }
    } catch (error) {
      showToast(error.response?.data?.message || "Thao tác thất bại!", "warning");
    }
  };

  const handleConfirmResetPassword = async () => {
    if (!resetConfirmUser) return;
    try {
      await centerManagerService.resetStaffPassword(resetConfirmUser.id);
      showToast(
        `Đã reset mật khẩu của "${resetConfirmUser.fullName}" về mặc định (123456) thành công!`,
        "info"
      );
      setResetConfirmUser(null);
    } catch (error) {
      showToast(error.response?.data?.message || "Reset mật khẩu thất bại!", "warning");
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phoneNumber.includes(searchTerm);
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalUsers = users.length;
  const headCount = users.filter((u) => u.role === "DEPARTMENT_HEAD").length;
  const teacherCount = users.filter((u) => u.role === "TEACHER").length;
  const lockedCount = users.filter((u) => !u.isActive).length;

  return (
    <div className="space-y-6 font-sans animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* TOAST NOTIFICATION */}
      {toast.show && (
        <div
          className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-300 border backdrop-blur-md text-sm font-bold ${
            toast.type === "warning"
              ? "bg-rose-500/90 text-white border-rose-400"
              : toast.type === "info"
              ? "bg-indigo-600/90 text-white border-indigo-400"
              : "bg-emerald-600/90 text-white border-emerald-400"
          }`}
        >
          {toast.type === "warning" ? (
            <AlertCircle className="w-5 h-5 shrink-0" />
          ) : toast.type === "info" ? (
            <Info className="w-5 h-5 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* PAGE HEADER & ACTION BUTTONS */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 md:p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
        <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/40 rounded-xl text-indigo-600 dark:text-indigo-400">
            <Users className="w-6 h-6 shrink-0" />
          </div>
          Quản lý Nhân sự
        </h1>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={fetchStaffData}
            disabled={loading}
            className="p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer shadow-sm active:scale-95 shrink-0"
            title="Tải lại dữ liệu"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin text-indigo-500" : ""}`} />
          </button>
          <button
            onClick={handleOpenAddModal}
            className="flex-1 sm:flex-initial bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold px-5 py-3 rounded-xl shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer whitespace-nowrap active:scale-95 border border-indigo-500/30"
          >
            <Plus className="w-5 h-5 stroke-[3] shrink-0" />
            Cấp phát tài khoản
          </button>
        </div>
      </div>

      {/* STATS & FILTER BAR */}
      <div className="space-y-5">
        {/* HÀNG 1: Quick Stats Cards (4 Cột) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-4 md:p-5 shadow-sm">
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider mb-1">Tổng Nhân sự</p>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{totalUsers}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-4 md:p-5 shadow-sm">
            <p className="text-[11px] text-purple-500 dark:text-purple-400 font-extrabold uppercase tracking-wider mb-1">Tổ trưởng</p>
            <p className="text-2xl font-black text-purple-600 dark:text-purple-400">{headCount}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-4 md:p-5 shadow-sm">
            <p className="text-[11px] text-blue-500 dark:text-blue-400 font-extrabold uppercase tracking-wider mb-1">Giáo viên</p>
            <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{teacherCount}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-4 md:p-5 shadow-sm">
            <p className="text-[11px] text-rose-500 dark:text-rose-400 font-extrabold uppercase tracking-wider mb-1">Đã khóa</p>
            <p className="text-2xl font-black text-rose-600 dark:text-rose-400">{lockedCount}</p>
          </div>
        </div>

        {/* HÀNG 2: Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 w-full bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
          <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl shadow-inner shrink-0 overflow-x-auto hide-scrollbar">
            {[
              { key: "ALL", label: "Tất cả" },
              { key: "DEPARTMENT_HEAD", label: "Tổ trưởng" },
              { key: "TEACHER", label: "Giáo viên" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setRoleFilter(tab.key)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  roleFilter === tab.key
                    ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/60 dark:border-slate-600"
                    : "text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-700/50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative min-w-[260px] flex-1 sm:max-w-md">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm tên hoặc SĐT..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* BẢNG DỮ LIỆU TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full min-h-[320px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-[320px] gap-3">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
                <RefreshCw className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">Đang tải dữ liệu nhân sự...</p>
            </div>
          ) : (
            <table className="w-full text-center border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200/60 dark:border-slate-800/60 text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6 w-16 text-center whitespace-nowrap">STT</th>
                  <th className="py-4 px-6 text-left whitespace-nowrap">Họ và Tên</th>
                  <th className="py-4 px-6 text-left whitespace-nowrap">Bộ môn</th>
                  <th className="py-4 px-6 text-center whitespace-nowrap">Vai trò</th>
                  <th className="py-4 px-6 text-center whitespace-nowrap">Trạng thái</th>
                  <th className="py-4 px-6 text-center w-40 whitespace-nowrap">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user, index) => (
                    <tr
                      key={user.id}
                      onDoubleClick={() => setDetailUser(user)}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer ${
                        !user.isActive ? "bg-slate-50/40 dark:bg-slate-900/40 opacity-80" : ""
                      }`}
                    >
                      <td className="py-4 px-6 font-bold text-slate-400 dark:text-slate-500 text-center whitespace-nowrap">
                        {index + 1}
                      </td>

                      <td className="py-4 px-6 text-left whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                            user.isActive ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                          }`}>
                            {user.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {user.fullName}
                            </p>
                            <p className="text-xs text-slate-500 font-mono mt-0.5">{user.phoneNumber}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-left whitespace-nowrap">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md text-xs">
                          {user.departmentName || "Chưa phân công"}
                        </span>
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex justify-center">
                          <RoleBadge role={user.role} />
                        </div>
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex justify-center">
                          <StatusBadge isActive={user.isActive} />
                        </div>
                      </td>

                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setResetConfirmUser(user)}
                            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-colors cursor-pointer border border-transparent hover:border-amber-200 dark:hover:border-amber-800/60"
                            title="Reset mật khẩu về mặc định (123456)"
                          >
                            <Key className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleOpenEditModal(user)}
                            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors cursor-pointer border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800/60"
                            title="Chỉnh sửa thông tin / Đổi vai trò"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleToggleStatus(user)}
                            className={`p-2 rounded-xl transition-colors cursor-pointer border border-transparent ${
                              user.isActive
                                ? "text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:border-rose-200 dark:hover:border-rose-800/60"
                                : "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border-emerald-200/60 dark:border-emerald-800/60"
                            }`}
                            title={user.isActive ? "Khóa tài khoản" : "Kích hoạt lại tài khoản"}
                          >
                            {user.isActive ? (
                              <Lock className="w-4 h-4" />
                            ) : (
                              <Unlock className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Users className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                        <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">Không tìm thấy nhân sự nào phù hợp.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODAL CẤP PHÁT / CHỈNH SỬA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/60 dark:border-slate-800/60 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="font-black text-slate-900 dark:text-slate-100 text-lg flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl text-indigo-600 dark:text-indigo-400">
                  <Users className="w-5 h-5" />
                </div>
                {editingUser ? "Sửa thông tin" : "Cấp phát tài khoản"}
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
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-4">
                <div className="group">
                  <label className="block text-xs font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2 group-focus-within:text-indigo-600 transition-colors">
                    <User className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-500" />
                    Họ và Tên <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Văn A"
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-bold transition-all"
                    autoFocus
                  />
                </div>

                <div className="group">
                  <label className="block text-xs font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2 group-focus-within:text-indigo-600 transition-colors">
                    <Phone className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-500" />
                    Số điện thoại (Tài khoản) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Ví dụ: 0987654321"
                    disabled={!!editingUser || isSubmitting}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-mono font-bold transition-all disabled:opacity-60 disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="group">
                  <label className="block text-xs font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2 group-focus-within:text-indigo-600 transition-colors">
                    <Building2 className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-500" />
                    Tổ chuyên môn <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 cursor-pointer font-bold transition-all"
                  >
                    <option value="" disabled>-- Chọn Tổ chuyên môn --</option>
                    {departmentsList.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {!editingUser && (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-800/40 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-3 mt-2 shadow-sm">
                  <Info className="w-5 h-5 text-amber-500 dark:text-amber-400 shrink-0" />
                  <div className="leading-relaxed font-medium">
                    <span className="font-black">Lưu ý:</span> Mật khẩu mặc định sẽ là:{" "}
                    <code className="bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-200 px-1.5 py-0.5 rounded-md font-mono font-black border border-amber-200 dark:border-amber-800">
                      123456
                    </code>
                    . Hệ thống sẽ yêu cầu đổi mật khẩu ở lần đăng nhập đầu tiên.
                  </div>
                </div>
              )}

              <div className="pt-6 flex items-center justify-end gap-3">
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
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-500/20 transition-all cursor-pointer flex items-center gap-2 active:scale-95"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  {editingUser ? "Cập nhật" : "Tạo tài khoản"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL RESET MẬT KHẨU */}
      {resetConfirmUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/60 dark:border-slate-800/60 w-full max-w-sm overflow-hidden p-6 md:p-8 text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-inner border border-amber-200/60 dark:border-amber-800/40">
              <Key className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-slate-100 text-lg">
                Reset mật khẩu?
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed font-medium">
                Cấp lại mật khẩu mặc định{" "}
                <strong className="text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono">123456</strong> cho{" "}
                <strong className="text-slate-900 dark:text-white">{resetConfirmUser.fullName}</strong>?
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                type="button"
                onClick={() => setResetConfirmUser(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer w-full"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmResetPassword}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md shadow-amber-500/20 transition-all cursor-pointer w-full active:scale-95"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL THÔNG TIN CHI TIẾT */}
      {detailUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/60 dark:border-slate-800/60 w-full max-w-sm overflow-hidden p-6 md:p-8 text-center animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-black flex items-center justify-center text-3xl mx-auto shadow-lg shadow-indigo-500/20 mb-4 border-4 border-white dark:border-slate-800">
              {detailUser.fullName.charAt(0)}
            </div>
            <div className="mb-6">
              <h3 className="font-black text-slate-900 dark:text-slate-100 text-xl">
                {detailUser.fullName}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-mono mt-1 font-semibold">
                {detailUser.phoneNumber}
              </p>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl flex flex-col gap-4 text-sm text-left border border-slate-200/60 dark:border-slate-700/60 shadow-inner">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-xs">Tổ chuyên môn</span>
                <span className="font-black text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 px-2 py-1 rounded-md shadow-sm border border-slate-200/60 dark:border-slate-700">{detailUser.departmentName || "Chưa phân công"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-xs">Vai trò</span>
                <RoleBadge role={detailUser.role} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-xs">Trạng thái</span>
                <StatusBadge isActive={detailUser.isActive} />
              </div>
            </div>

            <div className="pt-6">
              <button
                type="button"
                onClick={() => setDetailUser(null)}
                className="w-full px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-black text-sm transition-colors cursor-pointer active:scale-95"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
