/**
 * TechEdu Design System Tokens - Pixel-Perfect Color Palette (Light & Dark Mode)
 */

export const BUTTON_TOKENS = {
  primary:
    "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 active:scale-[0.98] text-white font-semibold rounded-xl px-4 py-2.5 shadow-sm shadow-indigo-200/80 hover:shadow-md hover:shadow-indigo-300 hover:-translate-y-0.5 transition-all duration-200 focus:ring-4 focus:ring-indigo-100 dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:shadow-none dark:focus:ring-indigo-900/60 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2",

  secondary:
    "bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 hover:text-slate-900 font-semibold rounded-xl px-4 py-2.5 border border-slate-200/90 hover:border-slate-300 shadow-sm transition-all duration-200 active:scale-[0.98] dark:bg-slate-800 dark:hover:bg-slate-700/80 dark:text-slate-200 dark:border-slate-700 cursor-pointer flex items-center justify-center gap-2",

  action:
    "bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 text-indigo-700 hover:text-indigo-800 font-semibold rounded-xl px-3.5 py-1.5 border border-indigo-100/80 transition-all duration-200 active:scale-[0.98] dark:bg-indigo-950/60 dark:hover:bg-indigo-900/80 dark:text-indigo-300 dark:border-indigo-900/60 cursor-pointer inline-flex items-center justify-center gap-1.5",
};

export const BADGE_TOKENS = {
  excellent:
    "bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-bold dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60 px-2.5 py-0.5 rounded-full text-xs",

  good:
    "bg-blue-50 text-blue-700 border border-blue-200/80 font-semibold dark:bg-blue-950/60 dark:text-blue-400 dark:border-blue-800/60 px-2.5 py-0.5 rounded-full text-xs",

  warning:
    "bg-amber-50 text-amber-700 border border-amber-200/80 font-semibold dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800/60 px-2.5 py-0.5 rounded-full text-xs",

  poor:
    "bg-rose-50 text-rose-700 border border-rose-200/80 font-bold dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-800/60 px-2.5 py-0.5 rounded-full text-xs",
};

export const CONTAINER_TOKENS = {
  appBackground:
    "bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 min-h-screen transition-colors duration-200",

  card:
    "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200",

  input:
    "bg-slate-50/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl px-4 py-2.5 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-950/80 transition-all outline-none",
};

/**
 * Returns badge class based on numeric score (0 - 10 scale)
 */
export function getScoreBadgeToken(score) {
  const num = Number(score);
  if (isNaN(num)) return BADGE_TOKENS.warning;
  if (num >= 8.0) return BADGE_TOKENS.excellent;
  if (num >= 5.0) return BADGE_TOKENS.good;
  return BADGE_TOKENS.poor;
}
