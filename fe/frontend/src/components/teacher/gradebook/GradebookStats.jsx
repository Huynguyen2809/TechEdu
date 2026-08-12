import React from "react";
import { Users, TrendingUp, Trophy, TrendingDown } from "lucide-react";

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="bg-white dark:bg-slate-900 cyber:bg-white rounded-2xl border border-slate-200/80 dark:border-slate-800 cyber:border-2 cyber:border-slate-900 p-5 shadow-sm dark:shadow-none cyber:shadow-[3px_3px_0_0_#0f172a] flex items-center gap-4">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${color}`}
      >
        <Icon className="w-6 h-6" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider truncate">
          {label}
        </p>
        <p className="text-2xl font-black text-slate-900 dark:text-slate-100 leading-tight mt-0.5">
          {value}
        </p>
        {sub && (
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

export default function GradebookStats({ stats }) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <StatCard
        icon={Users}
        label="Đã nộp bài"
        value={stats.total}
        color="bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-400 dark:border-indigo-900"
        sub="học sinh"
      />
      <StatCard
        icon={TrendingUp}
        label="Điểm trung bình"
        value={stats.avg.toFixed(2)}
        color="bg-violet-50 text-violet-600 border-violet-100 dark:bg-violet-950/60 dark:text-violet-400 dark:border-violet-900"
        sub="/ 10 điểm"
      />
      <StatCard
        icon={Trophy}
        label="Điểm cao nhất"
        value={stats.max.toFixed(2)}
        color="bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-900"
        sub="/ 10 điểm"
      />
      <StatCard
        icon={TrendingDown}
        label="Điểm thấp nhất"
        value={stats.min.toFixed(2)}
        color="bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-900"
        sub="/ 10 điểm"
      />
    </div>
  );
}
