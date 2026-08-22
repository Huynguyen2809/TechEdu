import React from "react";
import { Home, ChevronRight } from "lucide-react";

export default function RepositoryBreadcrumb({ folderHistory, onNavigate }) {
  return (
    <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 px-5 py-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm dark:shadow-none w-full overflow-x-auto">
      <span className="text-slate-400 text-xs uppercase font-extrabold mr-1 shrink-0">
        Vị trí:
      </span>
      {folderHistory.map((hist, index) => {
        const isCurrent = index === folderHistory.length - 1;
        return (
          <React.Fragment key={hist.id || `root-${index}`}>
            <div
              onClick={() => onNavigate(index)}
              className={`flex items-center gap-1.5 cursor-pointer hover:text-teal-600 dark:hover:text-teal-400 transition-colors whitespace-nowrap ${
                isCurrent
                  ? "text-teal-600 dark:text-teal-400 font-bold pointer-events-none bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 rounded-lg border border-teal-200/60 dark:border-teal-900/60"
                  : ""
              }`}
            >
              {index === 0 && <Home className="w-4 h-4 text-teal-500" />}
              <span>{hist.name}</span>
            </div>
            {!isCurrent && (
              <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
