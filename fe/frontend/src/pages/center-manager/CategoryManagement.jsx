import React, { useState, useEffect } from "react";
import {
  Plus,
  Tag,
  Beaker,
  Calculator,
  Atom,
  Layers,
  BookOpen,
  CheckCircle2,
  Trash2,
  X,
  AlertCircle,
  Sparkles,
  RefreshCw
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
import centerManagerService from "../../services/centerManagerService";

// Helper lấy Icon động từ chuỗi lưu trong CSDL
function getSubjectIcon(iconName) {
  switch (iconName) {
    case "Calculator":
      return Calculator;
    case "Atom":
      return Atom;
    case "Beaker":
      return Beaker;
    case "BookOpen":
      return BookOpen;
    default:
      return BookOpen;
  }
}

// Helper lấy màu sắc động từ chuỗi lưu trong CSDL
function getSubjectColorStyles(colorName) {
  switch (colorName) {
    case "violet":
    case "purple":
      return {
        cardColor: "from-violet-500/10 to-purple-500/10 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800/60",
        iconBg: "bg-violet-500 text-white"
      };
    case "amber":
    case "orange":
      return {
        cardColor: "from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/60",
        iconBg: "bg-amber-500 text-white"
      };
    case "emerald":
    case "teal":
      return {
        cardColor: "from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60",
        iconBg: "bg-emerald-500 text-white"
      };
    case "rose":
    case "red":
      return {
        cardColor: "from-rose-500/10 to-pink-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/60",
        iconBg: "bg-rose-500 text-white"
      };
    case "indigo":
    case "blue":
    default:
      return {
        cardColor: "from-indigo-500/10 to-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/60",
        iconBg: "bg-indigo-500 text-white"
      };
  }
}

// ─── SubjectCard Component ───────────────────────────────────────────
function SubjectCard({ subject, onDelete }) {
  const Icon = getSubjectIcon(subject.icon);
  const { cardColor, iconBg } = getSubjectColorStyles(subject.color);

  return (
    <div
      className={`bg-gradient-to-br ${cardColor} bg-white dark:bg-slate-900/80 p-4 rounded-2xl border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-between gap-3.5 group`}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition-transform ${iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="font-extrabold text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
            {subject.name}
          </p>
        </div>
      </div>

      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(subject);
          }}
          title="Xóa môn học"
          className="opacity-0 group-hover:opacity-100 p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer shrink-0"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN PAGE: CategoryManagement (Kết nối 100% Backend API)
// ═══════════════════════════════════════════════════════════════════════
export default function CategoryManagement() {
  const { showToast } = useToast();

  const [grades, setGrades] = useState([10, 11, 12]);
  const [subjectsByGrade, setSubjectsByGrade] = useState({});
  const [allSubjects, setAllSubjects] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState(12);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newGradeLevel, setNewGradeLevel] = useState(12);
  const [newIcon, setNewIcon] = useState("BookOpen");
  const [newColor, setNewColor] = useState("indigo");
  const [newDescription, setNewDescription] = useState("");
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");

  // Modal Xóa State
  const [subjectToDelete, setSubjectToDelete] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // Fetch dữ liệu thật từ Backend API
  const fetchCategoryData = async () => {
    setLoading(true);
    try {
      const res = await centerManagerService.getCategories();
      const data = res?.data || res;
      if (data) {
        setGrades(data.grades || [10, 11, 12]);
        setSubjectsByGrade(data.subjectsByGrade || {});
        setAllSubjects(data.allSubjects || []);
      }
    } catch (error) {
      console.error("Lỗi tải danh mục môn học:", error);
      showToast("Không thể tải danh mục môn học từ máy chủ.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryData();
  }, []);

  // Xử lý tạo môn học mới
  const handleCreateSubject = async (e) => {
    e.preventDefault();
    if (!newSubjectName.trim()) {
      setModalError("Vui lòng nhập tên môn học!");
      return;
    }

    setModalSubmitting(true);
    setModalError("");
    try {
      await centerManagerService.createCategory({
        name: newSubjectName.trim(),
        gradeLevel: Number(newGradeLevel),
        icon: newIcon,
        color: newColor,
        description: newDescription.trim() || undefined
      });

      showToast(`Đã thêm môn "${newSubjectName.trim()}" cho Khối ${newGradeLevel} thành công!`, "success");
      setIsAddModalOpen(false);
      setNewSubjectName("");
      setNewDescription("");
      fetchCategoryData();
    } catch (err) {
      setModalError(err.response?.data?.message || "Đã xảy ra lỗi khi tạo môn học!");
    } finally {
      setModalSubmitting(false);
    }
  };

  // Xử lý xóa môn học
  const handleConfirmDelete = async () => {
    if (!subjectToDelete) return;
    setDeleteSubmitting(true);
    try {
      await centerManagerService.deleteCategory(subjectToDelete.id);
      showToast(`Đã xóa môn "${subjectToDelete.name}" thành công!`, "success");
      setSubjectToDelete(null);
      fetchCategoryData();
    } catch (err) {
      showToast(err.response?.data?.message || "Không thể xóa môn học này!", "error");
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const currentSubjects = subjectsByGrade[selectedGrade] || [];

  return (
    <div className="space-y-6 font-sans animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 md:p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 dark:bg-amber-900/40 rounded-xl text-amber-500 shrink-0">
              <Tag className="w-6 h-6 shrink-0" />
            </div>
            Danh mục Khối & Môn học
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Dữ liệu môn học đồng bộ trực tiếp từ máy chủ Backend theo chuẩn GD&ĐT 2025
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchCategoryData}
            title="Tải lại dữ liệu"
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => {
              setNewGradeLevel(selectedGrade);
              setModalError("");
              setIsAddModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2 text-xs cursor-pointer active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Thêm Môn Học
          </button>
        </div>
      </div>

      {/* GRADE SELECTOR TABS */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-500" />
            Khối Lớp THPT
          </h2>
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
            Chọn khối để lọc danh sách môn học
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {grades.map((g) => {
            const active = selectedGrade === g;
            const count = (subjectsByGrade[g] || []).length;
            return (
              <button
                key={g}
                onClick={() => setSelectedGrade(g)}
                className={`py-4 px-5 rounded-2xl font-black text-base transition-all cursor-pointer border relative overflow-hidden group shadow-sm active:scale-95 ${
                  active
                    ? "bg-gradient-to-br from-indigo-600 to-violet-600 text-white border-transparent shadow-lg shadow-indigo-500/25"
                    : "bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border-slate-200/60 dark:border-slate-700/60 hover:bg-indigo-50/50 dark:hover:bg-slate-800"
                }`}
              >
                <span className="block font-black text-lg tracking-tight">Khối {g}</span>
                <span
                  className={`block text-xs font-bold mt-1 ${
                    active ? "text-indigo-100" : "text-slate-400 dark:text-slate-500"
                  }`}
                >
                  {count} môn học
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SUBJECTS GRID */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-4">
          <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
            <span>Danh sách môn học — Khối {selectedGrade}</span>
            <span className="bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-black px-2.5 py-0.5 rounded-full border border-indigo-200/60 dark:border-indigo-800/60">
              {currentSubjects.length} môn
            </span>
          </h3>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-bold text-slate-400">Đang tải danh mục từ máy chủ...</p>
          </div>
        ) : currentSubjects.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <BookOpen className="w-10 h-10 mx-auto opacity-40 text-slate-400" />
            <p className="text-sm font-bold">Chưa có môn học nào trong Khối {selectedGrade}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {currentSubjects.map((subject) => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                onDelete={(sub) => setSubjectToDelete(sub)}
              />
            ))}
          </div>
        )}
      </div>

      {/* STATS SUMMARY BAR */}
      <div className="grid sm:grid-cols-2 gap-4">
        {[
          { label: "Tổng số khối lớp", value: grades.length, unit: "khối", icon: Layers, color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-900/40" },
          {
            label: "Tổng số môn học",
            value: new Set(allSubjects.map((s) => s.name)).size || allSubjects.length,
            unit: "môn",
            icon: BookOpen,
            color: "text-violet-500 bg-violet-50 dark:bg-violet-900/40"
          },
        ].map(({ label, value, unit, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm p-5 flex items-center gap-4"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-800 ${color}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">
                {label}
              </p>
              <p className="text-xl font-black text-slate-900 dark:text-slate-100">
                {value} <span className="text-xs font-bold text-slate-400">{unit}</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: THÊM MÔN HỌC MỚI */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200/80 dark:border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-600" />
                Thêm Môn Học Mới
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubject} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-500 mb-1.5">
                  Tên môn học <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  placeholder="Ví dụ: Sinh học, Lịch sử, Tin học..."
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-500 mb-1.5">
                    Khối lớp
                  </label>
                  <select
                    value={newGradeLevel}
                    onChange={(e) => setNewGradeLevel(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value={10}>Khối 10</option>
                    <option value={11}>Khối 11</option>
                    <option value={12}>Khối 12</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-500 mb-1.5">
                    Biểu tượng Icon
                  </label>
                  <select
                    value={newIcon}
                    onChange={(e) => setNewIcon(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="Calculator">Máy tính (Toán)</option>
                    <option value="Atom">Nguyên tử (Lý)</option>
                    <option value="Beaker">Ống nghiệm (Hóa)</option>
                    <option value="BookOpen">Cuốn sách (Tổng hợp)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-500 mb-1.5">
                  Tone màu chủ đạo
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { id: "indigo", bg: "bg-indigo-500", label: "Indigo" },
                    { id: "violet", bg: "bg-violet-500", label: "Violet" },
                    { id: "amber", bg: "bg-amber-500", label: "Amber" },
                    { id: "emerald", bg: "bg-emerald-500", label: "Emerald" },
                    { id: "rose", bg: "bg-rose-500", label: "Rose" },
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setNewColor(c.id)}
                      className={`h-8 rounded-xl flex items-center justify-center ${c.bg} transition-all cursor-pointer ${
                        newColor === c.id ? "ring-3 ring-indigo-400 ring-offset-2 scale-105" : "opacity-70 hover:opacity-100"
                      }`}
                    >
                      {newColor === c.id && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-md shadow-indigo-500/20 cursor-pointer flex items-center gap-2"
                >
                  {modalSubmitting ? "Đang lưu..." : "Lưu Môn Học"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: XÁC NHẬN XÓA */}
      {subjectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200/80 dark:border-slate-800 space-y-4 text-center">
            <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/40 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Xóa môn "{subjectToDelete.name}"?
            </h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Môn học này sẽ bị xóa khỏi danh mục Khối {subjectToDelete.gradeLevel} trên toàn hệ thống.
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setSubjectToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleteSubmitting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-md shadow-rose-600/20 cursor-pointer"
              >
                {deleteSubmitting ? "Đang xóa..." : "Xác nhận xóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
