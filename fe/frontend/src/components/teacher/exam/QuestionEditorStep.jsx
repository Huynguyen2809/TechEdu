import React, { useState } from "react";
import { Zap, CheckCircle2, AlertCircle, X, ListChecks, FileDigit, CheckSquare } from "lucide-react";

function parseQuickImport(text, count) {
  const result = {};
  const regex = /(\d+)[.):\s]*([ABCD])/gi;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const num = parseInt(match[1], 10);
    if (num >= 1 && num <= count) {
      result[num] = match[2].toUpperCase();
    }
  }
  return result;
}

function Part1Matrix({ keys = [], onUpdate }) {
  const safeKeys = Array.isArray(keys) ? keys : [];
  const [quickText, setQuickText] = useState("");
  const [importMsg, setImportMsg] = useState(null);

  const handleQuickImport = () => {
    if (!quickText.trim()) return;
    const parsed = parseQuickImport(quickText, safeKeys.length);
    const count = Object.keys(parsed).length;
    if (count === 0) {
      setImportMsg({
        type: "warn",
        text: "Không đọc được đáp án nào. Kiểm tra định dạng (VD: 1A 2B 3C)."
      });
      return;
    }
    safeKeys.forEach((k, idx) => {
      const num = k.questionNumber;
      if (parsed[num]) {
        onUpdate(idx, "correctAnswer", parsed[num]);
      }
    });
    setImportMsg({
      type: "ok",
      text: `Đã điền ${count}/${safeKeys.length} câu từ chuỗi dán.`
    });
    setTimeout(() => setImportMsg(null), 3000);
  };

  return (
    <div className="space-y-4">
      {/* Quick Import Box */}
      <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-blue-500 dark:text-blue-400" />
          <p className="text-xs font-extrabold text-blue-700 dark:text-blue-300 uppercase tracking-wide">
            Nhập nhanh bảng đáp án
          </p>
        </div>
        <textarea
          value={quickText}
          onChange={(e) => setQuickText(e.target.value)}
          placeholder={
            "Dán chuỗi đáp án vào đây...\nVí dụ: 1A 2B 3C 4D 5A\nHoặc: 1.A 2.B 3.C 4.D 5.A"
          }
          rows={3}
          className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/60 rounded-xl text-sm font-mono text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
        />
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleQuickImport}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-sm"
          >
            <Zap className="w-3.5 h-3.5" />
            Nhập nhanh
          </button>
          {importMsg && (
            <span
              className={`flex items-center gap-1.5 text-xs font-semibold ${
                importMsg.type === "ok"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-amber-600 dark:text-amber-400"
              }`}
            >
              {importMsg.type === "ok" ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5" />
              )}
              {importMsg.text}
            </span>
          )}
          {quickText && (
            <button
              type="button"
              onClick={() => {
                setQuickText("");
                setImportMsg(null);
              }}
              className="ml-auto text-xs text-slate-400 hover:text-slate-600 cursor-pointer flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Xóa
            </button>
          )}
        </div>
      </div>

      {/* Ma trận ABCD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {safeKeys.map((ans, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2.5 hover:border-blue-200 transition-colors"
          >
            <span className="w-10 font-extrabold text-slate-600 dark:text-slate-300 text-sm shrink-0">
              Câu {idx + 1}
            </span>
            <div className="flex gap-1.5">
              {["A", "B", "C", "D"].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onUpdate(idx, "correctAnswer", opt)}
                  className={`w-8 h-8 rounded-lg font-extrabold text-xs transition-all cursor-pointer ${
                    ans.correctAnswer === opt
                      ? "bg-blue-600 text-white shadow-md scale-105"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-blue-100"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-1">
              <input
                type="number"
                step="0.05"
                value={ans.points}
                onChange={(e) =>
                  onUpdate(idx, "points", parseFloat(e.target.value) || 0)
                }
                className="w-14 px-1.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-center text-emerald-700 dark:text-emerald-400"
              />
              <span className="text-[10px] text-slate-400 font-bold">đ</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Part2Matrix({ keys = [], onUpdate }) {
  const safeKeys = Array.isArray(keys) ? keys : [];
  const parseArr = (str) => {
    const parts = (str || "").split(",");
    return ["D", "S", "D", "S"].map((def, i) => parts[i] || def);
  };

  const toggleSub = (idx, subIdx, val) => {
    const arr = parseArr(safeKeys[idx]?.correctAnswer);
    arr[subIdx] = val;
    onUpdate(idx, "correctAnswer", arr.join(","));
  };

  return (
    <div className="space-y-3">
      {safeKeys.map((ans, idx) => {
        const arr = parseArr(ans.correctAnswer);
        return (
          <div
            key={idx}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <p className="font-extrabold text-slate-700 dark:text-slate-200 text-sm">
                Câu {idx + 1}{" "}
                <span className="ml-2 text-xs font-normal text-slate-400">
                  (4 ý a, b, c, d)
                </span>
              </p>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400 font-medium">
                  Điểm tối đa:
                </span>
                <input
                  type="number"
                  step="0.1"
                  value={ans.points}
                  onChange={(e) =>
                    onUpdate(idx, "points", parseFloat(e.target.value) || 0)
                  }
                  className="w-16 px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-center text-emerald-700 dark:text-emerald-400"
                />
                <span className="text-xs text-slate-400 font-bold">đ</span>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {["a", "b", "c", "d"].map((sub, subIdx) => (
                <div key={sub} className="space-y-1.5">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase text-center">
                    Ý {sub}
                  </p>
                  <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner">
                    <button
                      type="button"
                      onClick={() => toggleSub(idx, subIdx, "D")}
                      className={`flex-1 py-2 text-xs font-extrabold transition-colors cursor-pointer ${
                        arr[subIdx] === "D"
                          ? "bg-emerald-500 text-white"
                          : "bg-white dark:bg-slate-800 text-slate-400"
                      }`}
                    >
                      Đúng
                    </button>
                    <div className="w-px bg-slate-200 dark:bg-slate-700" />
                    <button
                      type="button"
                      onClick={() => toggleSub(idx, subIdx, "S")}
                      className={`flex-1 py-2 text-xs font-extrabold transition-colors cursor-pointer ${
                        arr[subIdx] === "S"
                          ? "bg-rose-500 text-white"
                          : "bg-white dark:bg-slate-800 text-slate-400"
                      }`}
                    >
                      Sai
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Part3Matrix({ keys = [], onUpdate }) {
  const safeKeys = Array.isArray(keys) ? keys : [];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {safeKeys.map((ans, idx) => (
        <div
          key={idx}
          className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3 flex items-center justify-between gap-3"
        >
          <span className="font-extrabold text-slate-700 dark:text-slate-300 text-xs shrink-0">
            Câu {idx + 1}
          </span>
          <input
            type="text"
            value={ans.correctAnswer}
            onChange={(e) => onUpdate(idx, "correctAnswer", e.target.value)}
            placeholder="Đáp án ngắn..."
            className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100"
          />
          <div className="flex items-center gap-1 shrink-0">
            <input
              type="number"
              step="0.05"
              value={ans.points}
              onChange={(e) =>
                onUpdate(idx, "points", parseFloat(e.target.value) || 0)
              }
              className="w-14 px-1.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-center text-emerald-700 dark:text-emerald-400"
            />
            <span className="text-[10px] text-slate-400 font-bold">đ</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function QuestionEditorStep({
  part1Count,
  part2Count,
  part3Count,
  part1Keys,
  part2Keys,
  part3Keys,
  onUpdatePart1,
  onUpdatePart2,
  onUpdatePart3,
  activePartTab,
  setActivePartTab
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-6 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <ListChecks className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          2. Soạn Thảo Bảng Đáp Án &amp; Ma Trận Điểm
        </h2>
      </div>

      {/* Part Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActivePartTab("PART_1")}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
            activePartTab === "PART_1"
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
          }`}
        >
          <ListChecks className="w-4 h-4" />
          Phần 1: Trắc nghiệm ABCD ({part1Count} câu)
        </button>

        <button
          type="button"
          onClick={() => setActivePartTab("PART_2")}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
            activePartTab === "PART_2"
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          Phần 2: Đúng / Sai ({part2Count} câu)
        </button>

        <button
          type="button"
          onClick={() => setActivePartTab("PART_3")}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
            activePartTab === "PART_3"
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
          }`}
        >
          <FileDigit className="w-4 h-4" />
          Phần 3: Trả lời ngắn ({part3Count} câu)
        </button>
      </div>

      {/* Tab Contents */}
      {activePartTab === "PART_1" && (
        <Part1Matrix keys={part1Keys} onUpdate={onUpdatePart1} />
      )}
      {activePartTab === "PART_2" && (
        <Part2Matrix keys={part2Keys} onUpdate={onUpdatePart2} />
      )}
      {activePartTab === "PART_3" && (
        <Part3Matrix keys={part3Keys} onUpdate={onUpdatePart3} />
      )}
    </div>
  );
}
