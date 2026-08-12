import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, ChevronLeft, Plus, Tag, Beaker, Calculator, Atom, Globe, Microscope, PenLine } from "lucide-react";
import { useToast } from "../../context/ToastContext";

// ─── Dữ liệu tĩnh danh mục (Frontend-only, không cần API vì đây là cấu hình cố định của hệ thống)
const GRADES = [10, 11, 12];

const SUBJECTS_BY_GRADE = {
  10: [
    { name: "Toán học",       icon: Calculator, color: "bg-blue-50 text-blue-600 border-blue-200" },
    { name: "Vật lý",          icon: Atom,       color: "bg-violet-50 text-violet-600 border-violet-200" },
    { name: "Hóa học",         icon: Beaker,     color: "bg-amber-50 text-amber-600 border-amber-200" },
    { name: "Sinh học",        icon: Microscope, color: "bg-emerald-50 text-emerald-600 border-emerald-200" },
    { name: "Ngữ văn",         icon: PenLine,    color: "bg-rose-50 text-rose-600 border-rose-200" },
    { name: "Địa lý",          icon: Globe,      color: "bg-teal-50 text-teal-600 border-teal-200" },
    { name: "Lịch sử",         icon: BookOpen,   color: "bg-orange-50 text-orange-600 border-orange-200" },
    { name: "Tiếng Anh",       icon: Globe,      color: "bg-sky-50 text-sky-600 border-sky-200" },
  ],
  11: [
    { name: "Toán học",       icon: Calculator, color: "bg-blue-50 text-blue-600 border-blue-200" },
    { name: "Vật lý",          icon: Atom,       color: "bg-violet-50 text-violet-600 border-violet-200" },
    { name: "Hóa học",         icon: Beaker,     color: "bg-amber-50 text-amber-600 border-amber-200" },
    { name: "Sinh học",        icon: Microscope, color: "bg-emerald-50 text-emerald-600 border-emerald-200" },
    { name: "Ngữ văn",         icon: PenLine,    color: "bg-rose-50 text-rose-600 border-rose-200" },
    { name: "Địa lý",          icon: Globe,      color: "bg-teal-50 text-teal-600 border-teal-200" },
    { name: "Lịch sử",         icon: BookOpen,   color: "bg-orange-50 text-orange-600 border-orange-200" },
    { name: "Tiếng Anh",       icon: Globe,      color: "bg-sky-50 text-sky-600 border-sky-200" },
  ],
  12: [
    { name: "Toán học",       icon: Calculator, color: "bg-blue-50 text-blue-600 border-blue-200" },
    { name: "Vật lý",          icon: Atom,       color: "bg-violet-50 text-violet-600 border-violet-200" },
    { name: "Hóa học",         icon: Beaker,     color: "bg-amber-50 text-amber-600 border-amber-200" },
    { name: "Sinh học",        icon: Microscope, color: "bg-emerald-50 text-emerald-600 border-emerald-200" },
    { name: "Ngữ văn",         icon: PenLine,    color: "bg-rose-50 text-rose-600 border-rose-200" },
    { name: "Địa lý",          icon: Globe,      color: "bg-teal-50 text-teal-600 border-teal-200" },
    { name: "Lịch sử",         icon: BookOpen,   color: "bg-orange-50 text-orange-600 border-orange-200" },
    { name: "Tiếng Anh",       icon: Globe,      color: "bg-sky-50 text-sky-600 border-sky-200" },
    { name: "GDCD",             icon: BookOpen,   color: "bg-pink-50 text-pink-600 border-pink-200" },
  ],
};

// ─── SubjectCard ─────────────────────────────────────────────────────
function SubjectCard({ subject }) {
  const Icon = subject.icon;
  return (
    <div className={`flex items-center gap-3 p-3.5 rounded-xl border ${subject.color} bg-opacity-50`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${subject.color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <span className="font-semibold text-sm">{subject.name}</span>
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
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* TOP BAR */}
      <div className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <button
            onClick={() => navigate("/center-manager/dashboard")}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="font-extrabold text-slate-800 flex items-center gap-2">
            <Tag className="w-5 h-5 text-amber-500" />
            Danh mục Khối & Môn học
          </h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* NOTICE */}
        {showNotice && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-amber-400 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">!</div>
              <div>
                <p className="text-sm font-bold text-amber-800">Danh mục chuẩn Bộ GD&ĐT 2025</p>
                <p className="text-xs text-amber-600 mt-0.5">
                  Các môn học được cấu hình sẵn theo chương trình THPT. Giáo viên sẽ chọn từ danh sách này khi tạo lớp học.
                  Tính năng thêm/xóa môn học tùy chỉnh sẽ khả dụng trong phiên bản tiếp theo.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowNotice(false)}
              className="text-amber-400 hover:text-amber-600 cursor-pointer text-lg leading-none shrink-0"
            >
              ✕
            </button>
          </div>
        )}

        {/* GRADE SELECTOR */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="font-extrabold text-slate-800">Khối lớp THPT</h2>
              <p className="text-xs text-slate-400 mt-0.5">Chọn khối để xem danh sách môn học</p>
            </div>
            {/* Nút thêm môn học (UI-only placeholder cho tương lai) */}
            <button
              onClick={() => showToast("Tính năng thêm môn học tùy chỉnh sẽ khả dụng trong phiên bản tiếp theo.", "info")}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 border border-dashed border-slate-300 text-slate-500 hover:border-blue-400 hover:text-blue-600 rounded-xl transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Thêm môn học
            </button>
          </div>

          {/* Grade tabs */}
          <div className="flex gap-3">
            {GRADES.map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGrade(g)}
                className={`flex-1 py-3 rounded-xl font-extrabold text-base transition-all cursor-pointer border
                  ${selectedGrade === g
                    ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50"}`}
              >
                Khối {g}
                <span className={`block text-xs font-medium mt-0.5 ${selectedGrade === g ? "text-blue-200" : "text-slate-400"}`}>
                  {SUBJECTS_BY_GRADE[g].length} môn
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* SUBJECTS GRID */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-slate-800">
              Môn học — Khối {selectedGrade}
              <span className="ml-2 text-sm text-slate-400 font-normal">({subjects.length} môn)</span>
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {subjects.map((subject) => (
              <SubjectCard key={subject.name} subject={subject} />
            ))}
          </div>
        </div>

        {/* INFO BLOCK */}
        <div className="grid sm:grid-cols-3 gap-3 text-center">
          {[
            { label: "Tổng số khối", value: GRADES.length, unit: "khối" },
            { label: "Tổng số môn", value: [...new Set(Object.values(SUBJECTS_BY_GRADE).flat().map((s) => s.name))].length, unit: "môn" },
            { label: "Chuẩn theo", value: "GD&ĐT 2025", unit: "" },
          ].map(({ label, value, unit }) => (
            <div key={label} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
              <p className="text-xs text-slate-400 font-medium">{label}</p>
              <p className="text-xl font-extrabold text-slate-800 mt-1">
                {value} <span className="text-sm font-normal text-slate-400">{unit}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
