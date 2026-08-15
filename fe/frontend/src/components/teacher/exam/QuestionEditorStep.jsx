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

function Part1Matrix({ keys = [], onUpdate, examMode }) {
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
    <div className="space-y-6">
      {/* Quick Import Box */}
      <div className="bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-200/60 dark:border-indigo-800/40 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-100 dark:bg-indigo-800/60 rounded-lg">
            <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="text-sm font-extrabold text-indigo-900 dark:text-indigo-100 uppercase tracking-wide">
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
          className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800/60 rounded-xl text-sm font-mono text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 resize-none placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all shadow-sm"
        />
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleQuickImport}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl cursor-pointer transition-all shadow-sm active:scale-95"
          >
            <Zap className="w-4 h-4" />
            Nhập nhanh
          </button>
          {importMsg && (
            <span
              className={`flex items-center gap-2 text-sm font-bold animate-in fade-in slide-in-from-left-2 ${
                importMsg.type === "ok"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-amber-600 dark:text-amber-400"
              }`}
            >
              {importMsg.type === "ok" ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
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
              className="ml-auto text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer flex items-center gap-1.5 font-medium transition-colors"
            >
              <X className="w-4 h-4" /> Xóa
            </button>
          )}
        </div>
      </div>

      {/* Ma trận ABCD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {safeKeys.map((ans, idx) => (
          <div
            key={idx}
            className="flex flex-col gap-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 p-4 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all shadow-sm hover:shadow-md group"
          >
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-700 dark:text-slate-200 text-sm">
                Câu {idx + 1}
              </span>
              <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-inner">
                <input
                  type="number"
                  step="0.05"
                  value={ans.points}
                  disabled={examMode === "THPT"}
                  onChange={(e) =>
                    onUpdate(idx, "points", parseFloat(e.target.value) || 0)
                  }
                  className="w-12 bg-transparent text-xs font-black text-center text-emerald-600 dark:text-emerald-400 focus:outline-none disabled:opacity-50"
                />
                <span className="text-[10px] text-slate-400 font-bold uppercase">điểm</span>
              </div>
            </div>
            
            <div className="flex gap-2 justify-between w-full">
              {["A", "B", "C", "D"].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onUpdate(idx, "correctAnswer", opt)}
                  className={`flex-1 aspect-square rounded-xl font-black text-sm transition-all cursor-pointer active:scale-95 ${
                    ans.correctAnswer === opt
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20 scale-105"
                      : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:text-indigo-600 dark:hover:text-indigo-400"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Part2Matrix({ keys = [], onUpdate, examMode }) {
  const safeKeys = Array.isArray(keys) ? keys : [];
  const parseArr = (str) => {
    const parts = (str || "").split(",");
    return ["D", "D", "D", "D"].map((def, i) => parts[i] || def);
  };

  const toggleSub = (idx, subIdx, val) => {
    const arr = parseArr(safeKeys[idx]?.correctAnswer);
    arr[subIdx] = val;
    onUpdate(idx, "correctAnswer", arr.join(","));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {safeKeys.map((ans, idx) => {
        const arr = parseArr(ans.correctAnswer);
        return (
          <div
            key={idx}
            className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 p-5 space-y-4 hover:border-indigo-300 transition-all shadow-sm hover:shadow-md"
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
              <p className="font-extrabold text-slate-800 dark:text-slate-100 text-base">
                Câu {idx + 1}
              </p>
              <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-inner">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Điểm tối đa:</span>
                <input
                  type="number"
                  step="0.1"
                  value={ans.points}
                  disabled={examMode === "THPT"}
                  onChange={(e) =>
                    onUpdate(idx, "points", parseFloat(e.target.value) || 0)
                  }
                  className="w-12 bg-transparent text-sm font-black text-center text-emerald-600 dark:text-emerald-400 focus:outline-none disabled:opacity-50"
                />
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              {["a", "b", "c", "d"].map((sub, subIdx) => (
                <div key={sub} className="flex items-center justify-between gap-4">
                  <p className="text-sm font-black text-slate-700 dark:text-slate-300 w-6 text-center">
                    {sub}
                  </p>
                  <div className="flex gap-2 flex-1">
                    <button
                      type="button"
                      onClick={() => toggleSub(idx, subIdx, "D")}
                      className={`flex-1 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer border ${
                        arr[subIdx] === "D"
                          ? "bg-emerald-500 text-white border-emerald-600 shadow-sm"
                          : "bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 hover:border-emerald-300 hover:text-emerald-500"
                      }`}
                    >
                      Đúng
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleSub(idx, subIdx, "S")}
                      className={`flex-1 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer border ${
                        arr[subIdx] === "S"
                          ? "bg-rose-500 text-white border-rose-600 shadow-sm"
                          : "bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 hover:border-rose-300 hover:text-rose-500"
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

function Part3Matrix({ keys = [], onUpdate, examMode }) {
  const safeKeys = Array.isArray(keys) ? keys : [];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {safeKeys.map((ans, idx) => (
        <div
          key={idx}
          className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 p-4 flex flex-col gap-3 hover:border-indigo-300 transition-all shadow-sm hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-slate-800 dark:text-slate-100 text-sm">
              Câu {idx + 1}
            </span>
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-inner">
              <input
                type="number"
                step="0.05"
                value={ans.points}
                disabled={examMode === "THPT"}
                onChange={(e) =>
                  onUpdate(idx, "points", parseFloat(e.target.value) || 0)
                }
                className="w-12 bg-transparent text-sm font-black text-center text-emerald-600 dark:text-emerald-400 focus:outline-none disabled:opacity-50"
              />
              <span className="text-[10px] text-slate-400 font-bold uppercase">điểm</span>
            </div>
          </div>
          
          <div className="relative">
            <input
              type="text"
              maxLength={4}
              value={ans.correctAnswer}
              onChange={(e) => onUpdate(idx, "correctAnswer", e.target.value)}
              placeholder="Nhập đáp án ngắn vào đây..."
              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function QuestionEditorStep({
  examMode,
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
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 p-6 md:p-8 space-y-6 shadow-sm transition-all duration-300">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
            <ListChecks className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">
              2. Soạn Thảo Bảng Đáp Án &amp; Ma Trận Điểm
            </h2>
            <p className="text-xs text-slate-500 font-medium">Nhập đáp án đúng và điểm cho từng phần thi</p>
          </div>
        </div>
        {/* Realtime score */}
        <div className="hidden sm:flex flex-col items-end">
          <p className="text-xs font-bold text-slate-500 uppercase">Tổng điểm hiện tại</p>
          <div className="flex items-center gap-2 mt-1">
            <div className={`px-3 py-1 rounded-xl text-sm font-black shadow-sm border ${
              (() => {
                const totalScore = (part1Keys.reduce((a, b) => a + (Number(b.points) || 0), 0) +
                                    part2Keys.reduce((a, b) => a + (Number(b.points) || 0), 0) +
                                    part3Keys.reduce((a, b) => a + (Number(b.points) || 0), 0));
                if (Math.abs(totalScore - 10) < 0.001) return "bg-emerald-100 text-emerald-700 border-emerald-200";
                if (totalScore > 10) return "bg-rose-100 text-rose-700 border-rose-200 animate-pulse";
                return "bg-slate-100 text-slate-700 border-slate-200";
              })()
            }`}>
              {(part1Keys.reduce((a, b) => a + (Number(b.points) || 0), 0) +
                part2Keys.reduce((a, b) => a + (Number(b.points) || 0), 0) +
                part3Keys.reduce((a, b) => a + (Number(b.points) || 0), 0)).toFixed(2)} / 10.0
            </div>
          </div>
        </div>
      </div>

      {/* Part Tabs */}
      <div className="flex flex-wrap items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-2xl border border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setActivePartTab("PART_1")}
          className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activePartTab === "PART_1"
              ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/60 dark:border-slate-600"
              : "text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <ListChecks className="w-4 h-4" />
          Phần 1: Trắc nghiệm ({part1Count})
        </button>

        <button
          type="button"
          onClick={() => setActivePartTab("PART_2")}
          className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activePartTab === "PART_2"
              ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/60 dark:border-slate-600"
              : "text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          Phần 2: Đúng / Sai ({part2Count})
        </button>

        <button
          type="button"
          onClick={() => setActivePartTab("PART_3")}
          className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activePartTab === "PART_3"
              ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/60 dark:border-slate-600"
              : "text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <FileDigit className="w-4 h-4" />
          Phần 3: Trả lời ngắn ({part3Count})
        </button>
      </div>

      {/* Tab Contents */}
      <div className="pt-2 animate-in fade-in zoom-in-[0.98] duration-300">
        {activePartTab === "PART_1" && (
          <Part1Matrix keys={part1Keys} onUpdate={onUpdatePart1} examMode={examMode} />
        )}
        {activePartTab === "PART_2" && (
          <Part2Matrix keys={part2Keys} onUpdate={onUpdatePart2} examMode={examMode} />
        )}
        {activePartTab === "PART_3" && (
          <Part3Matrix keys={part3Keys} onUpdate={onUpdatePart3} examMode={examMode} />
        )}
      </div>
    </div>
  );
}
