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
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900/60 whitespace-nowrap">
        <Shield className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
        <span>Tổ trưởng</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60 whitespace-nowrap">
      <Award className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
      <span>Giáo viên</span>
    </span>
  );
}

// Helper hiển thị Status Badge
function StatusBadge({ isActive }) {
  return isActive ? (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60 whitespace-nowrap">
      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
      <span>Hoạt động</span>
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 whitespace-nowrap">
      <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
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
    <div className="space-y-6">
      {/* TOAST NOTIFICATION */}
      {toast.show && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce border text-sm font-medium ${
            toast.type === "warning"
              ? "bg-amber-600 text-white border-amber-500"
              : toast.type === "info"
              ? "bg-indigo-600 text-white border-indigo-500"
              : "bg-emerald-600 text-white border-emerald-500"
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
          <Users className="w-7 h-7 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span className="whitespace-nowrap">Quản lý Nhân sự</span>
        </h1>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={fetchStaffData}
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
            <span>Cấp phát tài khoản</span>
          </button>
        </div>
      </div>

      {/* 2. STATS & FILTER BAR: TÁCH LÀM 2 HÀNG ĐỘC LẬP (SPACE-Y-4) TOÀN DIỆN */}
      <div className="space-y-4">
        {/* HÀNG 1: Quick Stats Cards (4 Cột) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
            <p className="text-xs text-slate-400 font-medium whitespace-nowrap">Tổng Nhân sự</p>
            <p className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">{totalUsers}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
            <p className="text-xs text-slate-400 font-medium whitespace-nowrap">Tổ trưởng</p>
            <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">{headCount}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
            <p className="text-xs text-slate-400 font-medium whitespace-nowrap">Giáo viên</p>
            <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{teacherCount}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
            <p className="text-xs text-slate-400 font-medium whitespace-nowrap">Đã khóa</p>
            <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{lockedCount}</p>
          </div>
        </div>

        {/* HÀNG 2: Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 w-full">
          <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-xs shrink-0">
            {[
              { key: "ALL", label: "Tất cả" },
              { key: "DEPARTMENT_HEAD", label: "Tổ trưởng" },
              { key: "TEACHER", label: "Giáo viên" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setRoleFilter(tab.key)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  roleFilter === tab.key
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative min-w-[260px] flex-1 sm:max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm tên hoặc SĐT..."
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* 3. BẢNG DỮ LIỆU TABLE: OVERFLOW-X-AUTO W-FULL & WHITESPACE-NOWRAP CHO CẢ TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto w-full min-h-[320px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-[320px] gap-3">
              <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
              <p className="text-slate-400 font-medium text-sm">Đang tải dữ liệu nhân sự...</p>
            </div>
          ) : (
            <table className="w-full text-center border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6 w-16 text-center whitespace-nowrap">STT</th>
                  <th className="py-4 px-6 text-left whitespace-nowrap">Họ và Tên</th>
                  <th className="py-4 px-6 text-left whitespace-nowrap">Bộ môn</th>
                  <th className="py-4 px-6 text-center whitespace-nowrap">Vai trò</th>
                  <th className="py-4 px-6 text-center whitespace-nowrap">Trạng thái</th>
                  <th className="py-4 px-6 text-center w-36 whitespace-nowrap">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm text-slate-700 dark:text-slate-300">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user, index) => (
                    <tr
                      key={user.id}
                      onDoubleClick={() => setDetailUser(user)}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer ${
                        !user.isActive ? "bg-slate-50/40 dark:bg-slate-900/40" : ""
                      }`}
                    >
                      <td className="py-4 px-6 font-semibold text-slate-400 text-center whitespace-nowrap">
                        {index + 1}
                      </td>

                      <td className="py-4 px-6 font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 transition-colors whitespace-nowrap text-left">
                        {user.fullName}
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap text-left">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
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
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setResetConfirmUser(user)}
                            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/60 transition-colors cursor-pointer"
                            title="Reset mật khẩu về mặc định (123456)"
                          >
                            <Key className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleOpenEditModal(user)}
                            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors cursor-pointer"
                            title="Chỉnh sửa thông tin / Đổi vai trò"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleToggleStatus(user)}
                            className={`p-2 rounded-lg transition-colors cursor-pointer ${
                              user.isActive
                                ? "text-slate-500 dark:text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60"
                                : "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100"
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
                    <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                      Không tìm thấy nhân sự nào phù hợp.
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40">
              <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                {editingUser ? "Chỉnh sửa thông tin nhân sự" : "Cấp phát tài khoản mới"}
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
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  Họ và Tên <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  disabled={isSubmitting}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-medium"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  Số điện thoại (Tài khoản đăng nhập) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Ví dụ: 0987654321"
                  disabled={!!editingUser || isSubmitting}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-mono disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  Tổ chuyên môn (Bộ môn) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer font-medium"
                >
                  <option value="" disabled>-- Chọn Tổ chuyên môn --</option>
                  {departmentsList.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              {!editingUser && (
                <div className="p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 text-xs leading-relaxed flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Lưu ý:</span> Mật khẩu mặc định sẽ là:{" "}
                    <code className="bg-amber-100 dark:bg-amber-900 text-amber-900 dark:text-amber-200 px-1.5 py-0.5 rounded font-mono font-bold">
                      123456
                    </code>
                    . Nhân sự phải đổi mật khẩu lần đăng nhập đầu tiên.
                  </div>
                </div>
              )}

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
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm transition-all cursor-pointer flex items-center gap-2"
                >
                  {isSubmitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                  {editingUser ? "Cập nhật" : "Cấp phát tài khoản"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL RESET MẬT KHẨU */}
      {resetConfirmUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-sm overflow-hidden p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-base">
                Reset mật khẩu mặc định?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                Bạn có chắc chắn muốn cấp lại mật khẩu mặc định{" "}
                <strong className="text-slate-700 dark:text-slate-200">123456</strong> cho tài khoản{" "}
                <strong className="text-slate-800 dark:text-slate-100">{resetConfirmUser.fullName}</strong>?
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setResetConfirmUser(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmResetPassword}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
              >
                Xác nhận Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL THÔNG TIN CHI TIẾT */}
      {detailUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-sm overflow-hidden p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-xl mx-auto border border-indigo-200 dark:border-indigo-900/60 mb-2">
              {detailUser.fullName.charAt(0)}
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-lg">
                {detailUser.fullName}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-mono mt-1">
                {detailUser.phoneNumber}
              </p>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl flex flex-col gap-3 text-sm text-left border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-semibold">Tổ chuyên môn:</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">{detailUser.departmentName || "Chưa phân công"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-semibold">Vai trò:</span>
                <RoleBadge role={detailUser.role} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-semibold">Trạng thái:</span>
                <StatusBadge isActive={detailUser.isActive} />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setDetailUser(null)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm transition-colors cursor-pointer"
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
