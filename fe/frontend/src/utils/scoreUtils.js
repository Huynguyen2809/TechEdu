/**
 * scoreUtils.js — SMELL-01: Hàm xếp loại điểm dùng chung
 * Thay thế 2 bản định nghĩa lặp lại (không nhất quán) trong
 * StudentDashboard.jsx và ExamHistory.jsx
 */

/**
 * Trả về { label, color } theo thang điểm 10 chuẩn:
 *   >= 9.0 → Xuất sắc
 *   >= 8.0 → Giỏi
 *   >= 6.5 → Khá
 *   >= 5.0 → Trung bình
 *   < 5.0  → Yếu
 */
export function scoreGrade(score) {
  const num = Number(score);
  if (isNaN(num)) return {
    label: "Chưa có",
    color: "bg-slate-100 dark:bg-slate-800 cyber:bg-slate-200 text-slate-600 dark:text-slate-400 cyber:text-slate-900 border border-slate-200 dark:border-slate-700 cyber:border-2 cyber:border-slate-900 font-semibold px-2.5 py-1 rounded-lg",
  };
  if (num >= 9.0) return {
    label: "Xuất sắc",
    color: "bg-emerald-50 dark:bg-emerald-950/80 cyber:bg-emerald-300 text-emerald-700 dark:text-emerald-300 cyber:text-slate-900 border border-emerald-200 dark:border-emerald-800 cyber:border-2 cyber:border-slate-900 font-semibold px-2.5 py-1 rounded-lg",
  };
  if (num >= 8.0) return {
    label: "Giỏi",
    color: "bg-emerald-50 dark:bg-emerald-950/80 cyber:bg-emerald-300 text-emerald-700 dark:text-emerald-300 cyber:text-slate-900 border border-emerald-200 dark:border-emerald-800 cyber:border-2 cyber:border-slate-900 font-semibold px-2.5 py-1 rounded-lg",
  };
  if (num >= 6.5) return {
    label: "Khá",
    color: "bg-sky-50 dark:bg-sky-950/80 cyber:bg-sky-300 text-sky-700 dark:text-sky-300 cyber:text-slate-900 border border-sky-200 dark:border-sky-800 cyber:border-2 cyber:border-slate-900 font-semibold px-2.5 py-1 rounded-lg",
  };
  if (num >= 5.0) return {
    label: "Trung bình",
    color: "bg-amber-50 dark:bg-amber-950/80 cyber:bg-amber-300 text-amber-700 dark:text-amber-300 cyber:text-slate-900 border border-amber-200 dark:border-amber-800 cyber:border-2 cyber:border-slate-900 font-semibold px-2.5 py-1 rounded-lg",
  };
  return {
    label: "Yếu",
    color: "bg-rose-50 dark:bg-rose-950/80 cyber:bg-rose-300 text-rose-700 dark:text-rose-300 cyber:text-slate-900 border border-rose-200 dark:border-rose-800 cyber:border-2 cyber:border-slate-900 font-semibold px-2.5 py-1 rounded-lg",
  };
}
