import React, { useState, useCallback, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import {
  ZoomIn,
  ZoomOut,
  FileText,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";

// Cấu hình PDF.js worker — dùng CDN để không cần cấu hình thêm
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const MIN_SCALE = 0.5;
const MAX_SCALE = 2.5;
const SCALE_STEP = 0.2;

export default function PDFViewer({ pdfUrl }) {
  const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:8080";
  const fullPdfUrl = !pdfUrl ? "" : pdfUrl.startsWith("http") ? pdfUrl : `${SERVER_URL}${pdfUrl}`;
  const [numPages, setNumPages] = useState(null);
  const [scale, setScale] = useState(1.0);
  const [loadError, setLoadError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Drag to pan & ResizeObserver states
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

  // Tự động đo độ rộng container để Auto-fit đề thi
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const updateWidth = () => {
      setContainerWidth(Math.max(300, el.clientWidth - 32));
    };
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Gọi khi react-pdf load PDF xong
  const onDocumentLoadSuccess = useCallback(({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);
    setLoadError(false);
  }, []);

  // Gọi khi react-pdf gặp lỗi (CORS, file hỏng...)
  const onDocumentLoadError = useCallback(() => {
    setLoadError(true);
    setLoading(false);
  }, []);

  const zoomIn = () => setScale((s) => Math.min(MAX_SCALE, +(s + SCALE_STEP).toFixed(2)));
  const zoomOut = () => setScale((s) => Math.max(MIN_SCALE, +(s - SCALE_STEP).toFixed(2)));
  const resetZoom = () => setScale(1.0);

  // 1. Intercept Ctrl + Wheel để Zoom (không zoom toàn bộ trang web)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setScale((prev) => {
          const next = +(prev + delta).toFixed(2);
          return Math.min(MAX_SCALE, Math.max(MIN_SCALE, next));
        });
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, []);

  // 2. Drag-to-pan handlers
  const handleMouseDown = (e) => {
    if (!containerRef.current || e.button !== 0) return; // Chỉ nhận chuột trái
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      scrollLeft: containerRef.current.scrollLeft,
      scrollTop: containerRef.current.scrollTop,
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    containerRef.current.scrollLeft = dragStartRef.current.scrollLeft - dx;
    containerRef.current.scrollTop = dragStartRef.current.scrollTop - dy;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Fallback: nếu react-pdf lỗi thì dùng iframe trực tiếp
  if (loadError) {
    return (
      <div className="flex flex-col h-full">

        <iframe
          src={`${fullPdfUrl}#toolbar=0&navpanes=0`}
          title="Đề thi PDF (Fallback)"
          className="flex-1 w-full border-0"
          onContextMenu={(e) => e.preventDefault()}
        />
      </div>
    );
  }

  return (
    <div 
      className="flex flex-col h-full bg-slate-200 select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* ===== TOOLBAR DỌN DẸP ===== */}
      <div className="h-11 bg-slate-700 flex items-center justify-between px-4 gap-3 shrink-0 shadow-md">
        {/* Thông tin tổng trang */}
        <div className="flex items-center gap-2 text-xs font-semibold text-white bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-600/50">
          <FileText className="w-4 h-4 text-blue-400" />
          <span>
            {loading ? "Đang tải đề thi..." : numPages ? `Tất cả ${numPages} trang` : "..."}
          </span>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={zoomOut}
            disabled={scale <= MIN_SCALE}
            title="Thu nhỏ (-)"
            className="p-1.5 rounded-lg text-slate-200 hover:bg-white/15 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <span className="text-xs font-mono font-bold text-slate-100 w-14 text-center select-none bg-slate-800/60 py-1 rounded-md">
            {Math.round(scale * 100)}%
          </span>

          <button
            onClick={zoomIn}
            disabled={scale >= MAX_SCALE}
            title="Phóng to (+)"
            className="p-1.5 rounded-lg text-slate-200 hover:bg-white/15 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-600 mx-1" />

          {/* Reset Zoom */}
          <button
            onClick={resetZoom}
            title="Đặt lại mức thu phóng (100%)"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-600 hover:bg-slate-500 text-xs font-bold text-white transition-colors cursor-pointer shadow-sm"
          >
            <RotateCcw className="w-3 h-3" />
            <span>100%</span>
          </button>
        </div>
      </div>

      {/* ===== NỘI DUNG PDF CUỘN DỌC LIÊN TỤC ===== */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`flex-1 overflow-y-auto overflow-x-auto flex flex-col items-center py-6 px-4 transition-all ${
          isDragging ? "cursor-grabbing select-none" : "cursor-grab"
        }`}
      >
        {loading && (
          <div className="flex flex-col items-center justify-center gap-3 text-slate-600 my-auto py-20">
            <div className="w-8 h-8 border-3 border-slate-400/30 border-t-blue-600 rounded-full animate-spin" />
            <span className="text-sm font-bold">Đang hiển thị đề thi...</span>
          </div>
        )}

        <Document
          file={fullPdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={null} // Dùng loading state riêng của component
          className="flex flex-col items-center gap-6 w-full max-w-5xl"
        >
          {numPages &&
            Array.from(new Array(numPages), (el, index) => (
              <div
                key={`page_${index + 1}`}
                className="relative shadow-2xl rounded-sm overflow-hidden bg-white transition-transform duration-100"
              >
                <Page
                  pageNumber={index + 1}
                  width={containerWidth ? Math.min(1000, containerWidth) : undefined}
                  scale={scale}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  className="bg-white pointer-events-none"
                />
                {/* Badge số trang góc dưới */}
                <div className="absolute bottom-2.5 right-2.5 bg-slate-900/75 text-white text-[11px] font-mono font-bold px-2.5 py-1 rounded-md shadow-md pointer-events-none backdrop-blur-xs border border-white/10">
                  Trang {index + 1} / {numPages}
                </div>
              </div>
            ))}
        </Document>
      </div>
    </div>
  );
}
