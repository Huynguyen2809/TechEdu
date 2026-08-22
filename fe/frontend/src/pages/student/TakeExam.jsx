import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import examService from "../../services/examService";
import SplitScreenLayout from "../../components/exam/SplitScreenLayout";
import PDFViewer from "../../components/exam/PDFViewer";
import QuestionPalette from "../../components/exam/QuestionPalette";
import SubmissionDetailModal from "../../components/exam/SubmissionDetailModal";
import {
  AlertCircle,
  CheckCircle2,
  Trophy,
  Flag,
  AlertTriangle,
  Send,
  X,
  FileText,
  LogOut,
  Wifi,
  WifiOff,
} from "lucide-react";

// ============================================================
// TakeExam — Trang phòng thi chính với UX nâng cấp
// ============================================================
export default function TakeExam() {
  const { id: examId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // ─── STATE ──────────────────────────────────────────────────
  const [examData, setExamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Đáp án học sinh: { [questionId]: value | string[] }
  const [answers, setAnswers] = useState({});
  // Câu cần xem lại: { [questionId]: boolean }
  const [flaggedQuestions, setFlaggedQuestions] = useState({});
  // Đồng hồ đếm ngược (giây)
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Trạng thái đã ấn Bắt đầu thi chưa
  const [hasStarted, setHasStarted] = useState(false);
  // Cảnh báo gian lận
  const [warningCount, setWarningCount] = useState(0);
  // Kết quả sau khi nộp bài thành công (khôi phục từ state nếu F5)
  const [result, setResult] = useState(location.state?.result || null);
  // Modal xác nhận nộp bài
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  // Modal xác nhận thoát phòng thi (BUG-02)
  const [showExitConfirmModal, setShowExitConfirmModal] = useState(false);
  // Modal xem chi tiết bài làm & lời giải
  const [showDetailModal, setShowDetailModal] = useState(false);
  // Toast thông báo lỗi không chặn UI (BUG-01)
  const [toastMessage, setToastMessage] = useState("");

  // Key lưu nháp trong localStorage
  const DRAFT_KEY = `exam_draft_${examId}`;
  const PENDING_KEY = `pending_submission_${examId}`;

  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // ─── EFFECT: Lắng nghe sự kiện Online/Offline để tự nộp lại bài khi có mạng ─────────
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      const pendingData = localStorage.getItem(PENDING_KEY);
      if (pendingData) {
        try {
          const payload = JSON.parse(pendingData);
          examService.submitExam(examId, payload).then((res) => {
            localStorage.removeItem(PENDING_KEY);
            localStorage.removeItem(DRAFT_KEY);
            setResult(res);
            if (res?.submissionId) setShowDetailModal(true);
          }).catch((err) => {
            console.error("Lỗi nộp lại bài offline:", err);
          });
        } catch (e) {
          console.error("Lỗi đọc pending submission:", e);
        }
      }
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [examId, DRAFT_KEY, PENDING_KEY]);

  // ─── EFFECT: Tải dữ liệu phòng thi & khôi phục Nháp F5 ────────────────────────
  useEffect(() => {
    const fetchExam = async () => {
      // Nếu đã có kết quả (từ location state do F5), không cần tải lại đề thi
      if (result) {
        setLoading(false);
        return;
      }
      try {
        const data = await examService.getExamForTaking(examId);
        
        // Cấp lại số thứ tự riêng cho từng phần (bắt đầu từ 1)
        let countP1 = 0, countP2 = 0, countP3 = 0;
        if (data.answerSheetStructure) {
          data.answerSheetStructure = data.answerSheetStructure.map((q) => {
            let displayNumber = q.questionNumber;
            if (q.partType === "PART_1_ABCD") {
              countP1++;
              displayNumber = countP1;
            } else if (q.partType === "PART_2_TRUE_FALSE") {
              countP2++;
              displayNumber = countP2;
            } else if (q.partType === "PART_3_SHORT_ANSWER") {
              countP3++;
              displayNumber = countP3;
            }
            return { ...q, displayNumber };
          });
        }

        setExamData(data);

        // Khôi phục bài thi nháp nếu lỡ tay F5
        const savedDraft = localStorage.getItem(DRAFT_KEY);
        if (savedDraft) {
          try {
            const parsed = JSON.parse(savedDraft);
            if (parsed.answers) setAnswers(parsed.answers);
            if (parsed.flaggedQuestions) setFlaggedQuestions(parsed.flaggedQuestions);
            if (parsed.warningCount) setWarningCount(parsed.warningCount);
            
            // Tính lại thời gian làm bài còn lại dựa trên Mốc thời gian kết thúc (endTimeTimestamp)
            if (parsed.endTimeTimestamp) {
              const remaining = Math.max(0, Math.floor((parsed.endTimeTimestamp - Date.now()) / 1000));
              setTimeLeft(remaining);
            } else {
              setTimeLeft(data.durationMinutes * 60);
            }
          } catch (e) {
            console.error("Lỗi đọc nháp localStorage:", e);
            setTimeLeft(data.durationMinutes * 60);
          }
        } else {
          // Tạo mốc kết thúc mới nếu chưa có nháp
          const endTimeTimestamp = Date.now() + data.durationMinutes * 60 * 1000;
          setTimeLeft(data.durationMinutes * 60);
          localStorage.setItem(DRAFT_KEY, JSON.stringify({
            answers: {},
            flaggedQuestions: {},
            warningCount: 0,
            endTimeTimestamp,
          }));
        }
      } catch (err) {
        setError(
          err.response?.data?.message || "Không thể truy cập vào bài kiểm tra này."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [examId, DRAFT_KEY]);

  // ─── EFFECT: Tự động lưu nháp mỗi khi chọn đáp án / cắm cờ ────────────────────
  useEffect(() => {
    if (!examData || result || !hasStarted) return;
    const existing = localStorage.getItem(DRAFT_KEY);
    let endTimeTimestamp = Date.now() + (timeLeft || 0) * 1000;
    if (existing) {
      try {
        const parsed = JSON.parse(existing);
        if (parsed.endTimeTimestamp) endTimeTimestamp = parsed.endTimeTimestamp;
      } catch (e) {}
    }

    localStorage.setItem(DRAFT_KEY, JSON.stringify({
      answers,
      flaggedQuestions,
      warningCount,
      endTimeTimestamp,
    }));
  }, [answers, flaggedQuestions, warningCount, examData, DRAFT_KEY, timeLeft, result]);



  // ─── EFFECT: Tự động lưu nháp mỗi khi chọn đáp án / cắm cờ ────────────────────

  // ─── EFFECT: Anti-cheat (Toàn màn hình & Theo dõi chuyển tab) ───────────────
  useEffect(() => {
    if (!examData || result || isSubmitting || !hasStarted) return;

    // Yêu cầu Fullscreen khi bắt đầu
    const enterFullscreen = async () => {
      try {
        if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } catch (err) {}
    };
    enterFullscreen();

    const handleCheat = () => {
      setWarningCount(prev => {
        const newCount = prev + 1;
        setToastMessage(`🚨 CẢNH BÁO GIAN LẬN: Bạn vừa thoát toàn màn hình hoặc chuyển tab! (Vi phạm: ${newCount} lần)`);
        setTimeout(() => setToastMessage(""), 5000);
        return newCount;
      });
    };

    const handleVisibilityChange = () => {
      if (document.hidden) handleCheat();
    };
    const handleBlur = () => {
      handleCheat();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    };
  }, [examData, result, isSubmitting]);

  // ─── EFFECT: Đếm ngược thời gian ───────────────────────────
  useEffect(() => {
    if (!hasStarted || timeLeft <= 0 || !examData || isSubmitting || result) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Gọi qua ref để luôn có version mới nhất của executeSubmit
          executeSubmitRef.current?.(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examData, isSubmitting, result]);

  // ─── HANDLER: Ghi nhận đáp án học sinh ─────────────────────
  const handleAnswerChange = useCallback(
    (questionId, partType, value, subIndex = null) => {
      setAnswers((prev) => {
        const updated = { ...prev };
        if (partType === "PART_2_TRUE_FALSE") {
          const arr = [...(updated[questionId] || ["", "", "", ""])];
          arr[subIndex] = value;
          updated[questionId] = arr;
        } else {
          updated[questionId] = value;
        }
        return updated;
      });
    },
    []
  );

  // ─── HANDLER: Cắm cờ / Bỏ cắm cờ xem lại ────────────────────
  const handleToggleFlag = useCallback((questionId) => {
    setFlaggedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  }, []);

  // ─── HANDLER: Thực thi nộp bài gửi về Backend ───────────────
  const executeSubmit = useCallback(
    async (isAutoSubmit = false) => {
      setIsSubmitting(true);

      const timeSpentSeconds = examData.durationMinutes * 60 - timeLeft;

      const submitAnswers = examData.answerSheetStructure.map((q) => {
        let studentAnswer = answers[q.id];

        if (q.partType === "PART_2_TRUE_FALSE") {
          const arr = Array.isArray(studentAnswer)
            ? studentAnswer
            : ["", "", "", ""];
          studentAnswer = arr.every((v) => v === "") ? null : arr.join(",");
        }

        return {
          questionId: q.id,
          studentAnswer: studentAnswer || null,
        };
      });

      const payload = {
        timeSpentSeconds,
        answers: submitAnswers,
        warningCount: warningCount,
      };

      try {
        const res = await examService.submitExam(examId, payload);
        // Nộp thành công -> Xóa bài nháp trong localStorage
        localStorage.removeItem(DRAFT_KEY);
        localStorage.removeItem(PENDING_KEY);
        setResult(res);
        // Lưu state vào history để F5 không bị mất kết quả
        navigate(".", { replace: true, state: { result: res } });
        if (res?.submissionId) {
          setShowDetailModal(true);
        }
      } catch (err) {
        // Lưu tạm vào localStorage nếu rớt mạng để nộp lại khi reconnect
        localStorage.setItem(PENDING_KEY, JSON.stringify(payload));
        // BUG-01: Dùng Toast thay alert() để không chặn đồng hồ đếm ngược
        const msg = err.response?.data?.message || "Lỗi khi kết nối máy chủ nộp bài.";
        setToastMessage(`${msg} — Đã lưu tạm bài thi, sẽ tự động nộp lại khi có mạng!`);
        setTimeout(() => setToastMessage(""), 6000);
        setIsSubmitting(false);
      }
    },
    [answers, examData, examId, timeLeft, DRAFT_KEY, PENDING_KEY]
  );

  // ─── REF: Luôn giữ phiên bản executeSubmit mới nhất cho timer (BUG-03)
  const executeSubmitRef = useRef(null);
  useEffect(() => {
    executeSubmitRef.current = executeSubmit;
  }, [executeSubmit]);

  // ─── HANDLER: Thoát phòng thi — BUG-02: Dùng Modal thay window.confirm()
  const handleExit = useCallback(() => {
    setShowExitConfirmModal(true);
  }, []);

  // ─── TÍNH TOÁN DỮ LIỆU TỔNG KẾT CHO MODAL ──────────────────
  const totalQuestions = examData?.answerSheetStructure?.length || 0;
  const unansweredList = (examData?.answerSheetStructure || []).filter((q) => {
    const ans = answers[q.id];
    if (q.partType === "PART_2_TRUE_FALSE") {
      return !Array.isArray(ans) || ans.length < 4 || ans.some((v) => v === "");
    }
    return ans === undefined || ans === null || ans === "";
  });

  const flaggedList = (examData?.answerSheetStructure || []).filter(
    (q) => flaggedQuestions[q.id]
  );

  const answeredCount = totalQuestions - unansweredList.length;

  // ══════════════════════════════════════════════════════════════
  // RENDER: Các trạng thái đặc biệt (Loading / Error / Result)
  // ══════════════════════════════════════════════════════════════

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-900 gap-4">
        <div className="w-12 h-12 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
        <p className="text-slate-400 text-sm font-medium">Đang tải phòng thi...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-slate-900 flex flex-col items-center justify-center p-6 gap-5">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-lg font-bold text-white">Không thể vào phòng thi</h2>
          <p className="text-slate-400 text-sm max-w-sm">{error}</p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer"
        >
          Quay Lại
        </button>
      </div>
    );
  }

  // Màn hình kết quả sau khi nộp bài thành công
  if (result) {
    const scoreColor =
      result.totalScore >= 8
        ? "text-emerald-600"
        : result.totalScore >= 5
        ? "text-blue-600"
        : "text-orange-500";

    return (
      <div className="h-screen bg-[#F8FAFC] dark:bg-slate-950 flex items-center justify-center p-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl dark:shadow-2xl max-w-md w-full p-8 space-y-6 text-center border border-slate-200 dark:border-slate-800">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Nộp bài thành công!</h2>
            <p className="text-slate-600 dark:text-slate-400 font-medium text-sm mt-1.5">
              Điểm số đã được ghi nhận vào sổ điểm của thầy/cô.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 space-y-3 shadow-sm">
            <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400 text-xs font-extrabold uppercase tracking-widest">
              <Trophy className="w-4 h-4 text-amber-500" />
              Tổng điểm đạt được
            </div>
            <div className={`text-6xl font-black tabular-nums tracking-tight ${scoreColor}`}>
              {result.totalScore}
              <span className="text-2xl text-slate-500 dark:text-slate-400 font-bold">/10</span>
            </div>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Thời gian làm bài:{" "}
              <span className="font-extrabold text-slate-900 dark:text-slate-200">
                {Math.floor(result.timeSpentSeconds / 60)} phút{" "}
                {result.timeSpentSeconds % 60} giây
              </span>
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setShowDetailModal(true)}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl text-sm shadow-md active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <FileText className="w-5 h-5 text-amber-300" />
              <span>Xem Chi Tiết Bài Làm & Lời Giải</span>
            </button>

            <div className="flex gap-3">
              <button
                onClick={() => navigate("/student/history")}
                className="flex-1 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold py-3 rounded-xl text-sm shadow-sm active:scale-[0.98] transition-all cursor-pointer"
              >
                Xem Lịch Sử
              </button>
              <button
                onClick={() => navigate("/student/my-classes")}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl text-sm shadow-sm active:scale-[0.98] transition-all cursor-pointer"
              >
                Về Danh Sách Lớp
              </button>
            </div>
          </div>
        </div>

        {/* Modal chi tiết bài làm & lời giải */}
        {showDetailModal && result?.submissionId && (
          <SubmissionDetailModal
            submissionId={result.submissionId}
            onClose={() => setShowDetailModal(false)}
          />
        )}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // RENDER CHÍNH: Phòng thi Split-Screen
  // ══════════════════════════════════════════════════════════════
  
  if (!hasStarted && examData && !result) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-slate-100 text-center space-y-6">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl mx-auto flex items-center justify-center mb-2">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800">{examData.title}</h2>
            <p className="text-slate-500 mt-2 font-medium">Thời gian: {examData.durationMinutes} phút</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm p-4 rounded-xl text-left font-medium space-y-2">
            <p>⚠️ <strong>Quy chế thi:</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Hệ thống sẽ chuyển sang chế độ <strong>Toàn màn hình</strong>.</li>
              <li>Hành vi <strong>chuyển tab</strong> hoặc <strong>thu nhỏ trình duyệt</strong> sẽ bị ghi nhận là gian lận.</li>
              <li>Vui lòng chuẩn bị sẵn sàng trước khi bắt đầu.</li>
            </ul>
          </div>
          <button
            onClick={() => setHasStarted(true)}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl shadow-lg cursor-pointer transition-all"
          >
            Tôi đã hiểu & Bắt đầu làm bài
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SplitScreenLayout
        examTitle={examData.title}
        onExit={handleExit}
        leftPanel={<PDFViewer pdfUrl={examData.pdfUrl} />}
        rightPanel={
          <QuestionPalette
            questions={examData.answerSheetStructure}
            answers={answers}
            onAnswerChange={handleAnswerChange}
            flaggedQuestions={flaggedQuestions}
            onToggleFlag={handleToggleFlag}
            timeLeft={timeLeft}
            onSubmit={() => setShowConfirmModal(true)}
            isSubmitting={isSubmitting}
          />
        }
      />

      {/* ===== TOAST THÔNG BÁO LỖI KHÔNG CHẶN UI (BUG-01) ===== */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] max-w-md w-full px-4 animate-fade-in">
          <div className="bg-rose-600 text-white rounded-2xl shadow-2xl px-5 py-4 flex items-start gap-3">
            <WifiOff className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm font-semibold leading-relaxed flex-1">{toastMessage}</p>
            <button
              onClick={() => setToastMessage("")}
              className="shrink-0 text-white/70 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ===== MODAL XÁC NHẬN NỘP BÀI AN TOÀN ===== */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-5 border border-slate-100 relative">
            <button
              onClick={() => setShowConfirmModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                <Send className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-800">
                  Xác Nhận Nộp Bài Thi
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Hãy rà soát kỹ tiến độ làm bài trước khi gửi kết quả lên hệ thống.
                </p>
              </div>
            </div>

            {/* Thống kê tiến độ */}
            <div className="grid grid-cols-3 gap-2.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-center">
              <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-2xs">
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  Đã trả lời
                </p>
                <p className="text-lg font-extrabold text-blue-600 mt-0.5">
                  {answeredCount}/{totalQuestions}
                </p>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-2xs">
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  Bỏ trống
                </p>
                <p
                  className={`text-lg font-extrabold mt-0.5 ${
                    unansweredList.length > 0 ? "text-rose-600" : "text-emerald-600"
                  }`}
                >
                  {unansweredList.length} câu
                </p>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-2xs">
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  Cắm cờ 🚩
                </p>
                <p
                  className={`text-lg font-extrabold mt-0.5 ${
                    flaggedList.length > 0 ? "text-amber-600" : "text-slate-400"
                  }`}
                >
                  {flaggedList.length} câu
                </p>
              </div>
            </div>

            {/* Cảnh báo nếu còn câu chưa làm */}
            {unansweredList.length > 0 && (
              <div className="bg-rose-50 border border-rose-200/80 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-rose-700 font-extrabold text-sm">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <span>Chú ý: Bạn còn {unansweredList.length} câu chưa trả lời</span>
                </div>
                <div className="max-h-28 overflow-y-auto pr-2 custom-scrollbar">
                  <div className="flex flex-wrap gap-2">
                    {unansweredList.map((q) => {
                      const partLabel =
                        q.partType === "PART_1_ABCD"
                          ? "P.I"
                          : q.partType === "PART_2_TRUE_FALSE"
                          ? "P.II"
                          : "P.III";
                      return (
                        <span
                          key={q.id}
                          className="inline-flex items-center px-2.5 py-1 rounded-lg bg-white text-rose-600 text-[11px] font-bold border border-rose-200 shadow-sm"
                        >
                          {partLabel} - Câu {q.displayNumber}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Cảnh báo nếu có câu cắm cờ */}
            {flaggedList.length > 0 && (
              <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3 text-xs text-amber-800 flex items-center gap-2">
                <Flag className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
                <span>
                  Bạn đang có{" "}
                  <strong className="text-amber-900 font-extrabold">
                    {flaggedList.length} câu
                  </strong>{" "}
                  đang cắm cờ xem lại.
                </span>
              </div>
            )}

            {/* Nút hành động 2 bước */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors cursor-pointer"
              >
                Quay Lại Làm Tiếp
              </button>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  executeSubmit(false);
                }}
                disabled={isSubmitting}
                className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-extrabold text-sm rounded-xl shadow-lg shadow-indigo-200 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Xác Nhận Nộp Bài</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL XÁC NHẬN THOÁT PHÒNG THI (BUG-02) ===== */}
      {showExitConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 space-y-5 border border-slate-100">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
                <LogOut className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-800">Xác nhận thoát phòng thi?</h3>
                <p className="text-xs text-slate-500 mt-0.5">Bài làm của bạn chưa được nộp và sẽ bị mất hoàn toàn!</p>
              </div>
            </div>

            <div className="bg-rose-50 border border-rose-200/80 rounded-2xl p-3.5 flex items-center gap-2 text-rose-700 text-xs font-semibold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Hành động này không thể hoàn tác. Hãy cân nhắc kỹ trước khi thoát.</span>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setShowExitConfirmModal(false)}
                className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-extrabold text-sm rounded-xl shadow-lg shadow-indigo-200 transition-all cursor-pointer"
              >
                Tiếp tục thi
              </button>
              <button
                onClick={() => { setShowExitConfirmModal(false); navigate(-1); }}
                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors cursor-pointer"
              >
                Thoát
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
