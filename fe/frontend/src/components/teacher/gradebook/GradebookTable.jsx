import React, { useState, useMemo } from "react";
import { Search, Filter, Clock, Eye, Users, X } from "lucide-react";

function formatTime(seconds) {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m} phút ${s} giây`;
}

function formatDate(isoString) {
  if (!isoString) return "—";
  return new Date(isoString).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function getScoreBadgeStyle(score) {
  const s = Number(score) || 0;
  if (s >= 8.0) {
    return "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 font-black";
  }
  if (s >= 5.0) {
    return "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800 font-black";
  }
  return "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800 font-black";
}

export default function GradebookTable({
  scores,
  passRate,
  totalSubmissions,
  onSelectSubmission
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [resultFilter, setResultFilter] = useState("ALL"); // ALL | PASS | FAIL

  // Memorized filtered scores
  const filteredScores = useMemo(() => {
    if (!scores) return [];
    const term = searchTerm.toLowerCase().trim();
    return scores.filter((s) => {
      const nameMatch = (s.fullName || "").toLowerCase().includes(term);
      const phoneMatch = (s.phoneNumber || "").includes(term);
      const searchMatch = !term || nameMatch || phoneMatch;

      const isPass = Number(s.totalScore) >= 5.0;
      let filterMatch = true;
      if (resultFilter === "PASS") filterMatch = isPass;
      if (resultFilter === "FAIL") filterMatch = !isPass;

      return searchMatch && filterMatch;
    });
  }, [scores, searchTerm, resultFilter]);

  return (
    <div className="bg-white dark:bg-slate-900 cyber:bg-white rounded-3xl border border-slate-200/80 dark:border-slate-800 cyber:border-2 cyber:border-slate-900 shadow-sm dark:shadow-none cyber:shadow-[3px_3px_0_0_#0f172a] overflow-hidden">
      {/* Table Toolbar: Title + Search & Filter */}
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/40">
        <div>
          <p className="font-extrabold text-slate-800 dark:text-slate-100 text-sm">
            Bảng Kết Quả Học Sinh ({totalSubmissions} bài nộp)
          </p>
          <span className="text-xs bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-extrabold px-3 py-0.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800 inline-block mt-1">
            Tỷ lệ đạt (≥5.0đ): {passRate}%
          </span>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {/* Ô Tìm kiếm */}
          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo Tên hoặc SĐT..."
              className="w-full pl-9 pr-7 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 font-semibold text-slate-800 dark:text-slate-100"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setResultFilter("ALL")}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer transition-colors whitespace-nowrap ${
                resultFilter === "ALL"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setResultFilter("PASS")}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer transition-colors whitespace-nowrap ${
                resultFilter === "PASS"
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              Đạt (≥5đ)
            </button>
            <button
              onClick={() => setResultFilter("FAIL")}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer transition-colors whitespace-nowrap ${
                resultFilter === "FAIL"
                  ? "bg-amber-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              Chưa đạt (&lt;5đ)
            </button>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/60 text-left border-b border-slate-100 dark:border-slate-800 text-[11px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider">
              <th className="px-4 py-3">STT</th>
              <th className="px-4 py-3">Họ và Tên</th>
              <th className="px-4 py-3">Số Điện Thoại</th>
              <th className="px-4 py-3">Thời Gian Làm</th>
              <th className="px-4 py-3">Nộp Lúc</th>
              <th className="px-4 py-3 text-right">Tổng Điểm</th>
              <th className="px-4 py-3 text-center">Chi Tiết</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredScores.map((s, idx) => {
              const badgeStyle = getScoreBadgeStyle(s.totalScore);
              return (
                <tr
                  key={s.submissionId}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="px-4 py-3.5 text-slate-400 dark:text-slate-500 font-mono font-semibold">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-3.5 font-extrabold text-slate-900 dark:text-slate-100">
                    {s.fullName}
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 font-mono text-xs">
                    {s.phoneNumber || "—"}
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300 font-medium">
                    <span className="inline-flex items-center gap-1 text-xs">
                      <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      {formatTime(s.timeSpentSeconds)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 text-xs font-medium">
                    {formatDate(s.submittedAt)}
                  </td>

                  {/* Phân màu điểm (Xanh ≥8.0, Xanh dương ≥5.0, Cam <5.0) */}
                  <td className="px-4 py-3.5 text-right">
                    <span
                      className={`inline-block px-3 py-1 rounded-xl text-sm border ${badgeStyle}`}
                    >
                      {s.totalScore.toFixed(2)}
                    </span>
                  </td>

                  {/* Nút Xem Modal chi tiết bài làm */}
                  <td className="px-4 py-3.5 text-center">
                    <button
                      onClick={() => onSelectSubmission(s.submissionId)}
                      className="p-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer inline-flex items-center justify-center"
                      title="Xem chi tiết bài làm"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredScores.length === 0 && (
          <div className="flex flex-col items-center py-12 gap-2 text-slate-400">
            <Users className="w-8 h-8 text-slate-300 dark:text-slate-600" />
            <p className="text-xs font-medium">
              Không tìm thấy học sinh nào khớp với điều kiện lọc.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
