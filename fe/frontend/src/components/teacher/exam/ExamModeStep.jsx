import React from "react";
import { Zap, Settings, ArrowRight, LayoutList, AlertCircle } from "lucide-react";

export default function ExamModeStep({
  examMode,
  setExamMode,
  customPart1Count,
  setCustomPart1Count,
  customPart2Count,
  setCustomPart2Count,
  customPart3Count,
  setCustomPart3Count,
  customPart1Points,
  setCustomPart1Points,
  customPart2Points,
  setCustomPart2Points,
  customPart3Points,
  setCustomPart3Points,
  onNext
}) {
  const totalPoints = customPart1Points + customPart2Points + customPart3Points;
  const totalCount = customPart1Count + customPart2Count + customPart3Count;
  
  let warningMessage = null;
  if (examMode === "CUSTOM") {
    if (totalCount === 0) {
      warningMessage = "Đề thi phải có ít nhất 1 câu hỏi.";
    } else if (Math.abs(totalPoints - 10) > 0.01) {
      warningMessage = `Tổng điểm hiện tại là ${totalPoints.toFixed(2)}đ. Yêu cầu tổng điểm bằng 10.0đ.`;
    }
  }
  const isCustomValid = !warningMessage;

  const handleCountChange = (part, value) => {
    let c1 = part === 1 ? value : customPart1Count;
    let c2 = part === 2 ? value : customPart2Count;
    let c3 = part === 3 ? value : customPart3Count;

    let p1 = c1 > 0 ? customPart1Points : 0;
    let p2 = c2 > 0 ? customPart2Points : 0;
    let p3 = c3 > 0 ? customPart3Points : 0;

    let total = p1 + p2 + p3;
    
    if (c1 > 0 || c2 > 0 || c3 > 0) {
      let diff = 10 - total;
      if (c1 > 0) {
        p1 = Math.max(0, p1 + diff);
        diff = 10 - (p1 + p2 + p3);
      }
      if (c2 > 0 && Math.abs(diff) > 0.001) {
        p2 = Math.max(0, p2 + diff);
        diff = 10 - (p1 + p2 + p3);
      }
      if (c3 > 0 && Math.abs(diff) > 0.001) {
        p3 = Math.max(0, p3 + diff);
      }
    }

    if (part === 1) setCustomPart1Count(c1);
    if (part === 2) setCustomPart2Count(c2);
    if (part === 3) setCustomPart3Count(c3);

    setCustomPart1Points(Number(p1.toFixed(2)));
    setCustomPart2Points(Number(p2.toFixed(2)));
    setCustomPart3Points(Number(p3.toFixed(2)));
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 p-6 md:p-8 shadow-sm space-y-8 transition-all duration-300">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="p-2 bg-teal-50 dark:bg-teal-900/30 rounded-xl text-teal-600 dark:text-teal-400">
          <LayoutList className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">
            0. Chọn Chế Độ Tạo Đề
          </h2>
          <p className="text-xs text-slate-500 font-medium">Chọn cấu trúc đề thi bạn muốn sử dụng</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* THPT Mode Card */}
        <div
          onClick={() => setExamMode("THPT")}
          className={`relative p-6 rounded-3xl border-2 transition-all cursor-pointer group flex flex-col h-full ${
            examMode === "THPT"
              ? "border-teal-500 bg-teal-50/40 dark:bg-teal-900/20 shadow-md scale-[1.02]"
              : "border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-600 hover:bg-slate-50 dark:hover:bg-slate-800/50"
          }`}
        >
          {examMode === "THPT" && (
            <div className="absolute -top-3 -right-3 bg-teal-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-sm uppercase tracking-wider animate-in zoom-in">
              Đang Chọn
            </div>
          )}
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-2xl ${examMode === "THPT" ? "bg-teal-600 text-white shadow-sm" : "bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-teal-100 group-hover:text-teal-600 transition-colors"}`}>
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Đề THPT Quốc Gia</h3>
              <p className="text-xs font-bold text-emerald-500 mt-1 uppercase tracking-wider">Khuyến nghị</p>
            </div>
          </div>
          <div className="mt-5 space-y-2 flex-1">
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Cấu trúc đề chuẩn BGD&ĐT 2025.</p>
            <ul className="text-xs text-slate-500 font-semibold space-y-1 mt-3">
              <li className="flex items-center gap-2">• <span className="text-slate-700 dark:text-slate-300">18 câu ABCD</span> (0.25đ)</li>
              <li className="flex items-center gap-2">• <span className="text-slate-700 dark:text-slate-300">4 câu Đúng/Sai</span> (1.0đ)</li>
              <li className="flex items-center gap-2">• <span className="text-slate-700 dark:text-slate-300">6 câu Trả lời ngắn</span> (0.25đ)</li>
            </ul>
          </div>
        </div>

        {/* CUSTOM Mode Card */}
        <div
          onClick={() => setExamMode("CUSTOM")}
          className={`relative p-6 rounded-3xl border-2 transition-all cursor-pointer group flex flex-col h-full ${
            examMode === "CUSTOM"
              ? "border-emerald-500 bg-emerald-50/40 dark:bg-emerald-900/20 shadow-md scale-[1.02]"
              : "border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 hover:bg-slate-50 dark:hover:bg-slate-800/50"
          }`}
        >
          {examMode === "CUSTOM" && (
            <div className="absolute -top-3 -right-3 bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-sm uppercase tracking-wider animate-in zoom-in">
              Đang Chọn
            </div>
          )}
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-2xl ${examMode === "CUSTOM" ? "bg-emerald-600 text-white shadow-sm" : "bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors"}`}>
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Đề Tùy Chỉnh</h3>
              <p className="text-xs font-bold text-amber-500 mt-1 uppercase tracking-wider">Tự do cấu hình</p>
            </div>
          </div>
          <div className="mt-5 flex-1">
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-4">Giáo viên tự nhập số lượng câu hỏi và tự đặt điểm cho từng câu.</p>
            
            {examMode === "CUSTOM" && (
              <div className="space-y-3 bg-white dark:bg-slate-800/80 p-4 rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-700/50" onClick={(e) => e.stopPropagation()}>
                <div className="grid grid-cols-12 gap-2 pb-2 mb-2 border-b border-slate-100 dark:border-slate-700">
                  <div className="col-span-5 text-[10px] font-black text-slate-400 uppercase">Phần Thi</div>
                  <div className="col-span-3 text-[10px] font-black text-slate-400 uppercase text-center">Số Câu</div>
                  <div className="col-span-4 text-[10px] font-black text-slate-400 uppercase text-center">Tổng Điểm</div>
                </div>

                <div className="grid grid-cols-12 gap-2 items-center">
                  <label className="col-span-5 text-xs font-bold text-slate-600 dark:text-slate-300">Phần 1 (ABCD)</label>
                  <div className="col-span-3 flex justify-center">
                    <input type="number" min={0} max={100} value={customPart1Count} onChange={(e) => handleCountChange(1, parseInt(e.target.value) || 0)} className="w-full max-w-[60px] px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-center focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div className="col-span-4 flex justify-center items-center gap-1">
                    <input type="number" min={0} max={10} step={0.1} value={customPart1Points} onChange={(e) => setCustomPart1Points(parseFloat(e.target.value) || 0)} className="w-full max-w-[60px] px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-center focus:outline-none focus:border-emerald-500 text-emerald-600" />
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-2 items-center">
                  <label className="col-span-5 text-xs font-bold text-slate-600 dark:text-slate-300">Phần 2 (Đúng/Sai)</label>
                  <div className="col-span-3 flex justify-center">
                    <input type="number" min={0} max={50} value={customPart2Count} onChange={(e) => handleCountChange(2, parseInt(e.target.value) || 0)} className="w-full max-w-[60px] px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-center focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div className="col-span-4 flex justify-center items-center gap-1">
                    <input type="number" min={0} max={10} step={0.1} value={customPart2Points} onChange={(e) => setCustomPart2Points(parseFloat(e.target.value) || 0)} className="w-full max-w-[60px] px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-center focus:outline-none focus:border-emerald-500 text-emerald-600" />
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-2 items-center">
                  <label className="col-span-5 text-xs font-bold text-slate-600 dark:text-slate-300">Phần 3 (TL ngắn)</label>
                  <div className="col-span-3 flex justify-center">
                    <input type="number" min={0} max={50} value={customPart3Count} onChange={(e) => handleCountChange(3, parseInt(e.target.value) || 0)} className="w-full max-w-[60px] px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-center focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div className="col-span-4 flex justify-center items-center gap-1">
                    <input type="number" min={0} max={10} step={0.1} value={customPart3Points} onChange={(e) => setCustomPart3Points(parseFloat(e.target.value) || 0)} className="w-full max-w-[60px] px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-center focus:outline-none focus:border-emerald-500 text-emerald-600" />
                  </div>
                </div>
                
                <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center mt-1">
                  <span className="text-xs font-bold text-slate-500">Tổng cộng:</span>
                  <div className="flex gap-4">
                    <span className="text-sm font-black text-slate-700 dark:text-slate-200">{customPart1Count + customPart2Count + customPart3Count} câu</span>
                    <span className={`text-sm font-black ${totalPoints > 10 ? 'text-rose-500 animate-pulse' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {totalPoints.toFixed(2)}đ
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hành động tiếp theo cho bước 0 - hiển thị luôn ở card */}
      <div className="flex flex-col sm:flex-row items-end sm:items-center justify-end gap-4 pt-4">
        {warningMessage && (
          <div className="flex items-center gap-2 text-rose-600 bg-rose-50 dark:bg-rose-900/30 px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-800 animate-in fade-in slide-in-from-right-4 duration-300">
            <AlertCircle className="w-4 h-4" />
            <span className="text-xs font-bold">{warningMessage}</span>
          </div>
        )}
        <button
          onClick={onNext}
          disabled={examMode === "CUSTOM" && !isCustomValid}
          className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-bold rounded-xl transition-all shadow-sm active:scale-95 disabled:cursor-not-allowed"
        >
          Tiếp tục <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
