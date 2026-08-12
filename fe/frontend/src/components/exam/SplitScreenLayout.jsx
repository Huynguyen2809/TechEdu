import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, FileText, CheckSquare, GripVertical } from "lucide-react";

/**
 * SplitScreenLayout — Khung chia đôi màn hình cho phòng thi (Responsive + Resizable Divider)
 *
 * Props:
 *   - examTitle   : string — Tiêu đề đề thi hiển thị trên header
 *   - onExit      : function — Xử lý khi nhấn nút thoát
 *   - leftPanel   : ReactNode — Nội dung panel trái: PDF Viewer
 *   - rightPanel  : ReactNode — Nội dung panel phải: Phiếu trả lời
 */
export default function SplitScreenLayout({
  examTitle,
  onExit,
  leftPanel,
  rightPanel,
}) {
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const [mobileTab, setMobileTab] = useState("pdf"); // "pdf" | "sheet"
  const [leftWidth, setLeftWidth] = useState(68); // Phần trăm chiều rộng panel trái trên desktop (35% -> 80%)
  const [isDragging, setIsDragging] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia("(min-width: 1024px)").matches);

  const containerRef = useRef(null);
  const animationFrameId = useRef(null);

  // Sync isDesktop khi resize cửa sổ
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const handler = (e) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Lấy thống kê số câu hỏi và số câu đã trả lời từ props của rightPanel
  const questions = rightPanel?.props?.questions || [];
  const answers = rightPanel?.props?.answers || {};
  const totCount = questions.length || 0;
  const ansCount = questions.filter((q) => {
    const ans = answers[q.id];
    if (q?.partType === "PART_2_TRUE_FALSE") {
      return Array.isArray(ans) && ans.some((v) => v !== "");
    }
    return ans !== undefined && ans !== null && ans !== "";
  }).length;

  // Xử lý kéo thả thanh divider ở 60fps dùng requestAnimationFrame
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      animationFrameId.current = requestAnimationFrame(() => {
        const rect = containerRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const newLeftWidth = (mouseX / rect.width) * 100;
        // Giới hạn trong khoảng 35% đến 80%
        const clampedWidth = Math.max(35, Math.min(80, newLeftWidth));
        setLeftWidth(clampedWidth);
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isDragging]);

  return (
    <div className="h-screen h-[100dvh] w-screen flex flex-col overflow-hidden bg-slate-900 font-sans">
      {/* ===== TOP HEADER BAR ===== */}
      <header className="h-12 shrink-0 bg-slate-900 border-b border-slate-700 flex items-center justify-between px-4 gap-4 z-30 shadow-md">
        {/* Nút thoát + Tiêu đề */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onExit}
            title="Thoát phòng thi"
            className="p-1.5 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-bold text-white truncate max-w-md" title={examTitle}>
            {examTitle}
          </h1>
        </div>

        {/* Badge trạng thái + Nút Toggle trên Desktop */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Đang thi
          </span>

          {/* Nút Toggle Phiếu trả lời (Desktop) */}
          <button
            onClick={() => setIsRightCollapsed(!isRightCollapsed)}
            title={isRightCollapsed ? "Mở rộng Phiếu trả lời" : "Thu gọn Phiếu trả lời"}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600/60 text-xs font-bold transition-colors cursor-pointer"
          >
            {isRightCollapsed ? (
              <>
                <ChevronLeft className="w-3.5 h-3.5 text-blue-400" />
                <span>Mở phiếu trả lời</span>
              </>
            ) : (
              <>
                <span>Thu gọn</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </>
            )}
          </button>
        </div>
      </header>

      {/* ===== MOBILE TABS BAR (< 1024px) ===== */}
      <div className="lg:hidden flex border-b border-slate-700 bg-slate-800 shrink-0">
        <button
          onClick={() => setMobileTab("pdf")}
          className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-colors cursor-pointer ${
            mobileTab === "pdf"
              ? "border-blue-500 text-blue-400 bg-slate-800/80"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Đọc Đề PDF</span>
        </button>
        <button
          onClick={() => setMobileTab("sheet")}
          className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-colors cursor-pointer ${
            mobileTab === "sheet"
              ? "border-emerald-500 text-emerald-400 bg-slate-800/80"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          <span>📝 Phiếu Trắc Nghiệm ({ansCount}/{totCount})</span>
        </button>
      </div>

      {/* ===== MAIN SPLIT AREA ===== */}
      <div className="flex-1 flex overflow-hidden relative" ref={containerRef}>
        {/* ---- PANEL TRÁI: PDF Viewer ---- */}
        {/* Desktop: width được set qua style, Mobile: full width khi ở tab PDF */}
        <div
          className={`h-full overflow-hidden flex-shrink-0 ${
            mobileTab === "sheet" ? "hidden lg:flex" : "flex"
          } flex-col`}
          style={{
            width: isDesktop
              ? (isRightCollapsed ? "100%" : `${leftWidth}%`)
              : "100%",
          }}
        >
          {/* Trên mobile: chỉ dùng khi tab PDF đang active */}
          <div className="flex-1 min-h-0 h-full">
            {leftPanel}
          </div>
        </div>

        {/* ---- RESIZABLE DIVIDER VÀ GRIP HANDLE (Hiện trên Desktop khi không collapsed) ---- */}
        {!isRightCollapsed && (
          <div
            onMouseDown={handleMouseDown}
            className={`hidden lg:flex w-2.5 bg-slate-800 hover:bg-indigo-600 border-x border-slate-700/80 shrink-0 relative items-center justify-center cursor-col-resize select-none transition-colors z-20 group ${
              isDragging ? "bg-indigo-600 border-indigo-500" : ""
            }`}
            title="Kéo thả để điều chỉnh độ rộng màn hình"
          >
            <div className="w-4 h-10 rounded-full bg-slate-700 group-hover:bg-indigo-500 flex items-center justify-center text-slate-300 group-hover:text-white shadow-md border border-slate-600 transition-colors">
              <GripVertical className="w-3 h-3" />
            </div>

            {/* Nút thu gọn ở giữa thanh divider */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsRightCollapsed(true);
              }}
              title="Thu gọn Phiếu trả lời"
              className="absolute top-4 -left-2 z-30 w-5 h-8 bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white border border-slate-600 rounded-l-md flex items-center justify-center shadow-lg transition-colors cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ---- PANEL PHẢI: Phiếu trả lời ---- */}
        <div
          className={`h-full overflow-hidden relative bg-white flex-1 transition-all ${
            mobileTab === "pdf" ? "hidden lg:block" : "block"
          } ${isRightCollapsed ? "lg:!hidden" : ""}`}
        >
          {rightPanel}
        </div>

        {/* ---- THANH MỞ RỘNG KHI COLLAPSED TRÊN DESKTOP ---- */}
        {isRightCollapsed && (
          <div className="hidden lg:flex flex-col justify-center bg-slate-800 border-l border-slate-700 px-1.5 shrink-0 z-20 shadow-xl">
            <button
              onClick={() => setIsRightCollapsed(false)}
              title="Mở rộng Phiếu trả lời"
              className="py-6 px-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow-lg flex flex-col items-center gap-2 cursor-pointer transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span
                className="text-[11px] uppercase tracking-wider font-extrabold"
                style={{ writingMode: "vertical-rl" }}
              >
                Phiếu trả lời
              </span>
            </button>
          </div>
        )}

        {/* ---- FLOATING ACTION BUTTON (FAB) TRÊN MOBILE (< 1024px) ---- */}
        {mobileTab === "pdf" && (
          <button
            onClick={() => setMobileTab("sheet")}
            className="lg:hidden absolute bottom-5 right-5 z-40 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-extrabold px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-2.5 border-2 border-white/20 animate-bounce cursor-pointer text-sm"
          >
            <CheckSquare className="w-5 h-5 text-indigo-200" />
            <span>📝 Phiếu trả lời ({ansCount}/{totCount})</span>
          </button>
        )}
      </div>
    </div>
  );
}

