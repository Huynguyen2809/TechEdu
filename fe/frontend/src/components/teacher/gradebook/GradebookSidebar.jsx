import React from "react";
import { BookOpen, ChevronRight } from "lucide-react";

export default function GradebookSidebar({
  allExams,
  loadingExams,
  selectedExamId,
  onSelectExam
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm dark:shadow-none overflow-hidden sticky top-20">
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50">
        <p className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-teal-600 dark:text-teal-400" />{" "}
          Danh Sách Đề Thi
        </p>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[65vh] overflow-y-auto">
        {loadingExams ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-6 h-6 border-2 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
          </div>
        ) : allExams.length === 0 ? (
          <div className="flex flex-col items-center py-10 px-4 gap-2 text-center">
            <BookOpen className="w-8 h-8 text-slate-300 dark:text-slate-600" />
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              Chưa có đề thi nào.
            </p>
          </div>
        ) : (
          allExams.map((exam) => {
            const active = selectedExamId === exam.id;
            return (
              <button
                key={exam.id}
                onClick={() => onSelectExam(exam.id, exam.title)}
                className={`w-full text-left px-4 py-3.5 transition-all flex items-center justify-between gap-2 cursor-pointer ${
                  active
                    ? "bg-teal-50/80 dark:bg-teal-950/60 border-l-4 border-teal-600"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }`}
              >
                <div className="min-w-0">
                  <p
                    className={`text-xs sm:text-sm font-extrabold truncate ${
                      active
                        ? "text-teal-700 dark:text-teal-400"
                        : "text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    {exam.title}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate font-medium">
                    {exam.className}
                  </p>
                </div>
                <ChevronRight
                  className={`w-4 h-4 shrink-0 ${
                    active ? "text-teal-600 dark:text-teal-400" : "text-slate-300 dark:text-slate-600"
                  }`}
                />
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
