import React from "react";
import { Check, Copy, Users, Eye, Trash2, BookOpen } from "lucide-react";

export default function ClassTable({
  classes,
  copiedCode,
  onCopyCode,
  onViewClass,
  onOpenDeleteModal
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm dark:shadow-none overflow-hidden">
      <div className="overflow-x-auto w-full">
        <table className="w-full text-center border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap">
              <th className="py-4 px-6 w-16 text-center">STT</th>
              <th className="py-4 px-6 text-left min-w-[220px]">Tên Lớp Học</th>
              <th className="py-4 px-6 text-center min-w-[120px]">Môn Học</th>
              <th className="py-4 px-6 text-center min-w-[100px]">Khối Lớp</th>
              <th className="py-4 px-6 text-center min-w-[150px]">Mã Gia Nhập</th>
              <th className="py-4 px-6 text-center min-w-[110px]">Sĩ Số</th>
              <th className="py-4 px-6 text-center min-w-[120px]">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs font-semibold text-slate-700 dark:text-slate-200">
            {classes.map((cls, index) => (
              <tr
                key={cls.id}
                onClick={() => onViewClass(cls.id)}
                className="hover:bg-teal-50/30 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
              >
                {/* STT */}
                <td className="py-4 px-6 text-center text-slate-400 font-bold">
                  {index + 1}
                </td>

                {/* Tên Lớp Học */}
                <td className="py-4 px-6 text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-200/60 dark:border-teal-900/60 shrink-0 group-hover:scale-110 transition-transform">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <span className="font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors text-sm line-clamp-1">
                      {cls.name}
                    </span>
                  </div>
                </td>

                {/* Môn Học */}
                <td className="py-4 px-6 text-center">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                    {cls.subjectName || "Hóa học"}
                  </span>
                </td>

                {/* Khối Lớp */}
                <td className="py-4 px-6 text-center">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    Khối {cls.gradeLevel || "12"}
                  </span>
                </td>

                {/* Mã Gia Nhập (Join Code 1-click copy) */}
                <td className="py-4 px-6 text-center">
                  <button
                    type="button"
                    onClick={(e) => onCopyCode(cls.joinCode, e)}
                    className="font-mono tracking-widest text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-3 py-1.5 rounded-lg border border-teal-200/60 dark:border-teal-900/60 font-bold hover:bg-teal-100 dark:hover:bg-teal-900/50 inline-flex items-center gap-1.5 transition-all cursor-pointer text-xs"
                    title="Bấm 1-click để sao chép mã lớp"
                  >
                    <span>{cls.joinCode}</span>
                    {copiedCode === cls.joinCode ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-teal-400 group-hover:text-teal-600" />
                    )}
                  </button>
                </td>

                {/* Sĩ Số */}
                <td className="py-4 px-6 text-center">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-xs">
                    <Users className="w-3.5 h-3.5 text-teal-500" />
                    <span>{cls.studentCount || 0}</span>
                  </span>
                </td>

                {/* Thao Tác */}
                <td className="py-4 px-6 text-center">
                  <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onViewClass(cls.id)}
                      className="p-1.5 hover:bg-teal-50 dark:hover:bg-teal-950/60 text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 rounded-lg transition-colors cursor-pointer"
                      title="Xem chi tiết lớp"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => onOpenDeleteModal(cls, e)}
                      className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                      title="Xóa lớp học"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
