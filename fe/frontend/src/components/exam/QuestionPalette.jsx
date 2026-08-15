import React, { useState, useEffect } from "react";
import { Clock, Send, Flag, CheckCircle2, ListFilter, Lock } from "lucide-react";

// ============================================================
// Helper: Format giây thành MM:SS
// ============================================================
function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

// ============================================================
// Sub-component: Phần I — Trắc nghiệm ABCD
// ============================================================
function Part1Section({ questions, answers, onAnswerChange, flaggedQuestions, onToggleFlag }) {
  if (!questions.length) return null;
  return (
    <div className="space-y-3">
      <h3 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center justify-between">
        <span>
          Phần I · Trắc nghiệm nhiều lựa chọn
          <span className="ml-2 text-slate-400 font-normal normal-case">
            ({questions.length} câu · 0.25đ/câu)
          </span>
        </span>
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {questions.map((q, index) => {
          const isFlagged = !!flaggedQuestions?.[q.id];
          return (
            <div
              key={q.id}
              className={`flex flex-wrap items-center justify-between gap-2.5 p-2 rounded-xl border transition-all ${
                isFlagged
                  ? "bg-amber-50/80 border-amber-300 shadow-sm"
                  : "bg-slate-50 hover:bg-blue-50/30 border-slate-200/80"
              }`}
            >
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => onToggleFlag?.(q.id)}
                  title={isFlagged ? "Bỏ cắm cờ" : "Cắm cờ xem lại"}
                  className={`p-1 rounded-md transition-colors cursor-pointer ${
                    isFlagged
                      ? "text-amber-500 hover:bg-amber-200/50"
                      : "text-slate-300 hover:text-amber-400 hover:bg-slate-200/50"
                  }`}
                >
                  <Flag className={`w-3.5 h-3.5 ${isFlagged ? "fill-amber-500" : ""}`} />
                </button>
                <span className="font-extrabold text-slate-700 text-xs whitespace-nowrap select-none">
                  Câu {q.displayNumber}:
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {["A", "B", "C", "D"].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => onAnswerChange(q.id, q.partType, opt)}
                    title={`Câu ${q.displayNumber}: Chọn ${opt}`}
                    className={`w-7 h-7 rounded-lg text-[11px] font-bold transition-all duration-150 cursor-pointer select-none border
                      ${
                        answers[q.id] === opt
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200 scale-105"
                          : "bg-white border-slate-300 text-slate-600 hover:border-indigo-500 hover:bg-indigo-50"
                      }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// Sub-component: Phần II — Đúng/Sai
// ============================================================
function Part2Section({ questions, answers, onAnswerChange, flaggedQuestions, onToggleFlag }) {
  if (!questions.length) return null;
  return (
    <div className="space-y-3">
      <h3 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2">
        Phần II · Trắc nghiệm Đúng / Sai
        <span className="ml-2 text-slate-400 font-normal normal-case">
          ({questions.length} câu · tối đa 1.0đ/câu)
        </span>
      </h3>

      <div className="space-y-3">
        {questions.map((q, index) => {
          const stuArr = answers[q.id] || ["", "", "", ""];
          const isFlagged = !!flaggedQuestions?.[q.id];
          return (
            <div
              key={q.id}
              className={`rounded-xl border p-3 shadow-sm space-y-2.5 transition-all ${
                isFlagged
                  ? "bg-amber-50/80 border-amber-300"
                  : "bg-white border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onToggleFlag?.(q.id)}
                    title={isFlagged ? "Bỏ cắm cờ" : "Cắm cờ xem lại"}
                    className={`p-1 rounded-md transition-colors cursor-pointer ${
                      isFlagged
                        ? "text-amber-500 hover:bg-amber-200/50"
                        : "text-slate-300 hover:text-amber-400 hover:bg-slate-200/50"
                    }`}
                  >
                    <Flag className={`w-3.5 h-3.5 ${isFlagged ? "fill-amber-500" : ""}`} />
                  </button>
                  <p className="text-xs font-bold text-slate-700 whitespace-nowrap select-none">
                    Câu {q.displayNumber}:
                  </p>
                </div>

                {isFlagged && (
                  <span className="text-[10px] font-extrabold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-200">
                    🚩 Cần xem lại
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 min-[450px]:grid-cols-4 gap-2">
                {["a", "b", "c", "d"].map((sub, idx) => (
                  <div key={sub} className="flex flex-col items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400">
                      {sub}
                    </span>
                    <div className="flex rounded-lg overflow-hidden border border-slate-200 shadow-inner bg-slate-50">
                      {/* Nút Đúng */}
                      <button
                        type="button"
                        onClick={() => onAnswerChange(q.id, q.partType, "D", idx)}
                        title={`Ý ${sub}: Đúng`}
                        className={`w-8 h-7 text-[11px] font-extrabold cursor-pointer transition-colors duration-100 ${
                          stuArr[idx] === "D"
                            ? "bg-emerald-500 text-white"
                            : "text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"
                        }`}
                      >
                        Đ
                      </button>
                      <div className="w-px bg-slate-200" />
                      {/* Nút Sai */}
                      <button
                        type="button"
                        onClick={() => onAnswerChange(q.id, q.partType, "S", idx)}
                        title={`Ý ${sub}: Sai`}
                        className={`w-8 h-7 text-[11px] font-extrabold cursor-pointer transition-colors duration-100 ${
                          stuArr[idx] === "S"
                            ? "bg-rose-500 text-white"
                            : "text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                        }`}
                      >
                        S
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// Sub-component: Phần III — Trả lời ngắn
// ============================================================
function Part3Section({ questions, answers, onAnswerChange, flaggedQuestions, onToggleFlag }) {
  if (!questions.length) return null;
  return (
    <div className="space-y-3">
      <h3 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2">
        Phần III · Trả lời ngắn
        <span className="ml-2 text-slate-400 font-normal normal-case">
          ({questions.length} câu · 0.25đ/câu)
        </span>
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {questions.map((q, index) => {
          const isFlagged = !!flaggedQuestions?.[q.id];
          return (
            <div
              key={q.id}
              className={`space-y-1.5 p-2 rounded-xl border transition-all ${
                isFlagged
                  ? "bg-amber-50/80 border-amber-300"
                  : "bg-slate-50/60 border-slate-200/80"
              }`}
            >
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-slate-700 whitespace-nowrap select-none flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onToggleFlag?.(q.id)}
                    title={isFlagged ? "Bỏ cắm cờ" : "Cắm cờ xem lại"}
                    className={`p-1 rounded-md transition-colors cursor-pointer ${
                      isFlagged
                        ? "text-amber-500 hover:bg-amber-200/50"
                        : "text-slate-300 hover:text-amber-400 hover:bg-slate-200/50"
                    }`}
                  >
                    <Flag className={`w-3.5 h-3.5 ${isFlagged ? "fill-amber-500" : ""}`} />
                  </button>
                  <span>Câu {q.displayNumber}:</span>
                </label>
                {isFlagged && (
                  <span className="text-[10px] font-extrabold text-amber-700 bg-amber-100/80 px-1.5 py-0.5 rounded-full border border-amber-200">
                    🚩
                  </span>
                )}
              </div>

              <input
                type="text"
                inputMode="decimal"
                maxLength={4}
                value={answers[q.id] || ""}
                onChange={(e) => {
                  const cleanVal = e.target.value.replace(/\s+/g, "");
                  onAnswerChange(q.id, q.partType, cleanVal);
                }}
                placeholder="Nhập số..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-center
                  focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent
                  shadow-inner placeholder:font-normal placeholder:text-slate-400 transition-shadow"
              />
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200/80 rounded-lg p-2.5 font-medium leading-relaxed">
        💡 <strong>Lưu ý:</strong> Nhập tối đa 4 ký tự (ví dụ: -3,25 hoặc 12,5) theo quy chế Bộ GD&ĐT 2025.
      </p>
    </div>
  );
}

// ============================================================
// MAIN EXPORT: QuestionPalette
// ============================================================
export default function QuestionPalette({
  questions = [],
  answers = {},
  onAnswerChange,
  flaggedQuestions = {},
  onToggleFlag,
  timeLeft,
  onSubmit,
  isSubmitting,
}) {
  // Auto-save Badge State
  const [lastSavedTime, setLastSavedTime] = useState("");

  // Filter Tab State: "all" | "unanswered" | "flagged"
  const [filterTab, setFilterTab] = useState("all");

  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setLastSavedTime(timeStr);
    }
  }, [answers]);

  const part1 = questions.filter((q) => q.partType === "PART_1_ABCD");
  const part2 = questions.filter((q) => q.partType === "PART_2_TRUE_FALSE");
  const part3 = questions.filter((q) => q.partType === "PART_3_SHORT_ANSWER");

  // Đếm số câu đã làm
  const answeredCount = questions.filter((q) => {
    const ans = answers[q.id];
    if (q.partType === "PART_2_TRUE_FALSE") {
      return Array.isArray(ans) && ans.length === 4 && ans.every((v) => v !== "");
    }
    return ans !== undefined && ans !== null && ans !== "";
  }).length;

  const unansweredCount = questions.length - answeredCount;
  const flaggedCount = questions.filter((q) => flaggedQuestions[q.id]).length;

  const percent = questions.length
    ? Math.round((answeredCount / questions.length) * 100)
    : 0;

  const isLowTime = timeLeft < 300;

  // Function lọc danh sách câu hỏi theo filterTab
  const filterQuestions = (qList) => {
    if (filterTab === "unanswered") {
      return qList.filter((q) => {
        const ans = answers[q.id];
        if (q.partType === "PART_2_TRUE_FALSE") {
          return !Array.isArray(ans) || ans.length < 4 || ans.some((v) => v === "");
        }
        return ans === undefined || ans === null || ans === "";
      });
    }
    if (filterTab === "flagged") {
      return qList.filter((q) => flaggedQuestions[q.id]);
    }
    return qList;
  };

  const filteredPart1 = filterQuestions(part1);
  const filteredPart2 = filterQuestions(part2);
  const filteredPart3 = filterQuestions(part3);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* ===== ĐỒNG HỒ ĐẾM NGƯỢC & PROGRESS BAR ===== */}
      <div
        className={`shrink-0 flex flex-col items-center justify-center py-3.5 border-b border-slate-100 gap-1.5 transition-colors duration-500 ${
          isLowTime ? "bg-red-50 border-red-100" : "bg-slate-50"
        }`}
      >
        <div className="flex items-center justify-between w-full px-4 text-[10px] uppercase tracking-widest font-extrabold text-slate-400">
          <span>⏱ Thời gian còn lại</span>
          {/* Badge Auto-save */}
          {lastSavedTime && (
            <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80 lowercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Đã lưu ({lastSavedTime})
            </span>
          )}
        </div>

        <div
          className={`flex items-center gap-2 text-3xl font-mono font-extrabold tabular-nums transition-colors ${
            isLowTime ? "text-red-600 animate-pulse" : "text-indigo-600"
          }`}
        >
          <Clock className="w-6 h-6" />
          {formatTime(timeLeft)}
        </div>

        {/* Progress bar % */}
        <div className="w-48 h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden shadow-inner">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isLowTime ? "bg-red-500" : "bg-indigo-600"
            }`}
            style={{
              width: `${percent}%`,
            }}
          />
        </div>
        <p className="text-xs text-slate-500 font-bold mt-0.5">
          Đã làm <span className="text-indigo-600 font-extrabold">{answeredCount}</span>/
          {questions.length} câu ({percent}%)
        </p>
      </div>

      {/* ===== BỘ LỌC CÂU HỎI NHANH ===== */}
      <div className="shrink-0 bg-slate-100/70 border-b border-slate-200/70 p-2 flex items-center justify-center gap-1.5">
        <button
          type="button"
          onClick={() => setFilterTab("all")}
          className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
            filterTab === "all"
              ? "bg-white text-indigo-600 shadow-2xs border border-slate-200/80"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Tất cả ({questions.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterTab("unanswered")}
          className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
            filterTab === "unanswered"
              ? "bg-rose-500 text-white shadow-2xs"
              : "text-slate-500 hover:text-rose-600"
          }`}
        >
          Chưa làm ({unansweredCount})
        </button>
        <button
          type="button"
          onClick={() => setFilterTab("flagged")}
          className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
            filterTab === "flagged"
              ? "bg-amber-500 text-white shadow-2xs"
              : "text-slate-500 hover:text-amber-600"
          }`}
        >
          🚩 Cắm cờ ({flaggedCount})
        </button>
      </div>

      {/* ===== PHIẾU TRẢ LỜI ===== */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-6">
        {filteredPart1.length === 0 && filteredPart2.length === 0 && filteredPart3.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-1">
            <ListFilter className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-500">Không tìm thấy câu hỏi phù hợp bộ lọc.</p>
          </div>
        ) : (
          <>
            <Part1Section
              questions={filteredPart1}
              answers={answers}
              onAnswerChange={onAnswerChange}
              flaggedQuestions={flaggedQuestions}
              onToggleFlag={onToggleFlag}
            />
            <Part2Section
              questions={filteredPart2}
              answers={answers}
              onAnswerChange={onAnswerChange}
              flaggedQuestions={flaggedQuestions}
              onToggleFlag={onToggleFlag}
            />
            <Part3Section
              questions={filteredPart3}
              answers={answers}
              onAnswerChange={onAnswerChange}
              flaggedQuestions={flaggedQuestions}
              onToggleFlag={onToggleFlag}
            />
          </>
        )}
      </div>

      {/* ===== NÚT NỘP BÀI ===== */}
      <div className="shrink-0 w-full p-3 bg-white border-t border-slate-200 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        <button
          id="btn-submit-exam"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-extrabold py-3.5 rounded-xl
            shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2.5
            cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed text-sm tracking-wide"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Đang chấm điểm...</span>
            </>
          ) : (
            <>
              <Send className="w-4.5 h-4.5" />
              <span>NỘP BÀI THI</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
