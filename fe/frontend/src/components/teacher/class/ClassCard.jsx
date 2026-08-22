import React from "react";
import { Check, Copy, Users, Eye, Trash2 } from "lucide-react";

export default function ClassCard({
  cls,
  copiedCode,
  onCopyCode,
  onViewClass,
  onOpenDeleteModal
}) {
  return (
    <div
      onClick={() => onViewClass(cls.id)}
      className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm dark:shadow-none hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-6 cursor-pointer relative overflow-hidden"
    >
      {/* Top Indigo Line */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 to-teal-700"></div>

      <div className="space-y-4 pt-1">
        <div className="flex items-start justify-between gap-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-teal-100/70 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 border border-teal-200/50 dark:border-teal-900/60">
            {cls.subjectName || "Hóa học"} • Khối {cls.gradeLevel || "12"}
          </span>

          {/* Mã Join Code Badge: 1-click copy */}
          <button
            type="button"
            onClick={(e) => onCopyCode(cls.joinCode, e)}
            className="font-mono tracking-widest text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-3 py-1.5 rounded-lg border border-teal-200/60 dark:border-teal-900/60 font-bold hover:bg-teal-100 dark:hover:bg-teal-900/50 flex items-center gap-1.5 transition-all cursor-pointer text-xs"
            title="Bấm 1-click để sao chép mã lớp"
          >
            <span>{cls.joinCode}</span>
            {copiedCode === cls.joinCode ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-teal-400 group-hover:text-teal-600" />
            )}
          </button>
        </div>

        <div>
          <h3 className="font-black text-slate-900 dark:text-slate-100 text-lg group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors line-clamp-2 leading-snug">
            {cls.name}
          </h3>
        </div>
      </div>

      <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-700 text-teal-700 dark:text-teal-400 font-bold">
          <Users className="w-4 h-4 text-teal-500 dark:text-teal-400" />
          <span>{cls.studentCount || 0} Học sinh</span>
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onViewClass(cls.id)}
            className="p-2 hover:bg-teal-50 dark:hover:bg-teal-950/60 text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 rounded-xl transition-colors cursor-pointer:bg-slate-200:border-slate-900"
            title="Xem chi tiết lớp"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => onOpenDeleteModal(cls, e)}
            className="p-2 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl transition-colors cursor-pointer:bg-slate-200:border-slate-900"
            title="Xóa lớp học"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
