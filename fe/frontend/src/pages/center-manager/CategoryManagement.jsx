import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  ChevronLeft,
  Plus,
  Tag,
  Beaker,
  Calculator,
  Atom,
  Globe,
  Microscope,
  PenLine,
  Sparkles,
  Info,
  Layers,
  CheckCircle2
} from "lucide-react";
import { useToast } from "../../context/ToastContext";

// ─── Dữ liệu tĩnh danh mục chuẩn GD&ĐT 2025 ──────────────────────────
const GRADES = [10, 11, 12];

const SUBJECTS_BY_GRADE = {
  10: [
    { name: "Toán học", icon: Calculator, color: "from-indigo-500/10 to-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/60", iconBg: "bg-indigo-500 text-white" },
    { name: "Vật lý", icon: Atom, color: "from-violet-500/10 to-purple-500/10 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800/60", iconBg: "bg-violet-500 text-white" },
    { name: "Hóa học", icon: Beaker, color: "from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/60", iconBg: "bg-amber-500 text-white" },
    { name: "Sinh học", icon: Microscope, color: "from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60", iconBg: "bg-emerald-500 text-white" },
    { name: "Ngữ văn", icon: PenLine, color: "from-rose-500/10 to-pink-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/60", iconBg: "bg-rose-500 text-white" },
    { name: "Địa lý", icon: Globe, color: "from-teal-500/10 to-cyan-500/10 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800/60", iconBg: "bg-teal-500 text-white" },
    { name: "Lịch sử", icon: BookOpen, color: "from-orange-500/10 to-amber-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800/60", iconBg: "bg-orange-500 text-white" },
    { name: "Tiếng Anh", icon: Globe, color: "from-violet-500/10 to-indigo-500/10 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800/60", iconBg: "bg-violet-500 text-white" },
  ],
  11: [
    { name: "Toán học", icon: Calculator, color: "from-indigo-500/10 to-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/60", iconBg: "bg-indigo-500 text-white" },
    { name: "Vật lý", icon: Atom, color: "from-violet-500/10 to-purple-500/10 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800/60", iconBg: "bg-violet-500 text-white" },
    { name: "Hóa học", icon: Beaker, color: "from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/60", iconBg: "bg-amber-500 text-white" },
    { name: "Sinh học", icon: Microscope, color: "from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60", iconBg: "bg-emerald-500 text-white" },
    { name: "Ngữ văn", icon: PenLine, color: "from-rose-500/10 to-pink-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/60", iconBg: "bg-rose-500 text-white" },
    { name: "Địa lý", icon: Globe, color: "from-teal-500/10 to-cyan-500/10 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800/60", iconBg: "bg-teal-500 text-white" },
    { name: "Lịch sử", icon: BookOpen, color: "from-orange-500/10 to-amber-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800/60", iconBg: "bg-orange-500 text-white" },
    { name: "Tiếng Anh", icon: Globe, color: "from-violet-500/10 to-indigo-500/10 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800/60", iconBg: "bg-violet-500 text-white" },
  ],
  12: [
    { name: "Toán học", icon: Calculator, color: "from-indigo-500/10 to-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/60", iconBg: "bg-indigo-500 text-white" },
    { name: "Vật lý", icon: Atom, color: "from-violet-500/10 to-purple-500/10 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800/60", iconBg: "bg-violet-500 text-white" },
    { name: "Hóa học", icon: Beaker, color: "from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/60", iconBg: "bg-amber-500 text-white" },
    { name: "Sinh học", icon: Microscope, color: "from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60", iconBg: "bg-emerald-500 text-white" },
    { name: "Ngữ văn", icon: PenLine, color: "from-rose-500/10 to-pink-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/60", iconBg: "bg-rose-500 text-white" },
    { name: "Địa lý", icon: Globe, color: "from-teal-500/10 to-cyan-500/10 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800/60", iconBg: "bg-teal-500 text-white" },
    { name: "Lịch sử", icon: BookOpen, color: "from-orange-500/10 to-amber-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800/60", iconBg: "bg-orange-500 text-white" },
    { name: "Tiếng Anh", icon: Globe, color: "from-violet-500/10 to-indigo-500/10 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800/60", iconBg: "bg-violet-500 text-white" },
    { name: "GDCD", icon: BookOpen, color: "from-pink-500/10 to-purple-500/10 text-pink-600 dark:text-pink-400 border-pink-200 dark:border-pink-800/60", iconBg: "bg-pink-500 text-white" },
  ],
};

// ─── SubjectCard Component ───────────────────────────────────────────
function SubjectCard({ subject }) {
  const Icon = subject.icon;
  return (
    <div
      className={`bg-gradient-to-br ${subject.color} bg-white dark:bg-slate-900/80 p-4 rounded-2xl border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-3.5 group cursor-pointer`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition-transform ${subject.iconBg}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="font-extrabold text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {subject.name}
        </p>
        <span className="inline-block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          Môn bắt buộc / Tự chọn
        </span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN PAGE: CategoryManagement
// ═══════════════════════════════════════════════════════════════════════
export default function CategoryManagement() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [selectedGrade, setSelectedGrade] = useState(12);
  const [showNotice, setShowNotice] = useState(true);

  const subjects = SUBJECTS_BY_GRADE[selectedGrade] || [];

  return (
    <div className="space-y-6 font-sans animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 md:p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/center-manager/dashboard")}
            className="p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all cursor-pointer shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
              <Tag className="w-6 h-6 text-amber-500 shrink-0" />
              Danh mục Khối & Môn học
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Cấu hình môn học áp dụng toàn hệ thống theo chuẩn GD&ĐT 2025
            </p>
          </div>
        </div>

        <button
          onClick={() =>
            showToast(
              "Tính năng thêm môn học tùy chỉnh sẽ khả dụng trong phiên bản tiếp theo.",
              "info"
            )
          }
          className="bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/40 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold px-4 py-2.5 rounded-xl border border-indigo-200/60 dark:border-indigo-800/60 transition-all flex items-center gap-2 text-xs cursor-pointer shadow-sm active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Thêm Môn Học
        </button>
      </div>

      {/* NOTICE BANNER */}
      {showNotice && (
        <div className="relative bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-900/20 rounded-2xl p-4 md:p-5 border border-amber-200/80 dark:border-amber-800/60 flex items-start justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-base shrink-0 shadow-sm mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-black text-amber-900 dark:text-amber-300">
                Danh mục chuẩn Bộ Giáo dục &amp; Đào tạo 2025
              </p>
              <p className="text-xs text-amber-800/80 dark:text-amber-400 mt-1 leading-relaxed font-medium">
                Các môn học được định nghĩa sẵn theo khung chương trình THPT mới. Giáo viên sẽ sử dụng danh sách chuẩn này khi khởi tạo lớp học và biên soạn đề thi.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowNotice(false)}
            className="text-amber-500 hover:text-amber-700 dark:hover:text-amber-300 cursor-pointer text-lg leading-none p-1 shrink-0 transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* GRADE SELECTOR TABS */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-500" />
            Khối Lớp THPT
          </h2>
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
            Chọn khối để lọc môn học
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {GRADES.map((g) => {
            const active = selectedGrade === g;
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
                  {SUBJECTS_BY_GRADE[g].length} môn học
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
              {subjects.length} môn
            </span>
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {subjects.map((subject) => (
            <SubjectCard key={subject.name} subject={subject} />
          ))}
        </div>
      </div>

      {/* STATS SUMMARY BAR */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: "Tổng số khối lớp", value: GRADES.length, unit: "khối", icon: Layers, color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-900/40" },
          {
            label: "Tổng số môn học",
            value: [
              ...new Set(
                Object.values(SUBJECTS_BY_GRADE)
                  .flat()
                  .map((s) => s.name)
              ),
            ].length,
            unit: "môn",
            icon: BookOpen,
            color: "text-violet-500 bg-violet-50 dark:bg-violet-900/40"
          },
          { label: "Chuẩn cấu trúc", value: "GD&ĐT 2025", unit: "", icon: CheckCircle2, color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/40" },
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
    </div>
  );
}

