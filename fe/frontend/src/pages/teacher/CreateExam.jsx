import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import RepositoryPickerModal from "../../components/exam/RepositoryPickerModal";
import classService from "../../services/classService";
import examService from "../../services/examService";
import { useToast } from "../../context/ToastContext";
import {
  FileText,
  ListChecks,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Save
} from "lucide-react";

import ExamBasicInfoStep from "../../components/teacher/exam/ExamBasicInfoStep";
import QuestionEditorStep from "../../components/teacher/exam/QuestionEditorStep";
import ExamPreviewStep from "../../components/teacher/exam/ExamPreviewStep";

function toDatetimeLocal(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function CreateExam() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [step, setStep] = useState(1); // 1: Info, 2: Questions, 3: Preview
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [classes, setClasses] = useState([]);

  // Form State
  const [title, setTitle] = useState("");
  const [classId, setClassId] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(45);

  const now = new Date();
  const defaultEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const [startTime, setStartTime] = useState(toDatetimeLocal(now));
  const [endTime, setEndTime] = useState(toDatetimeLocal(defaultEnd));

  // PDF Repo Picker State
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [selectedExamPdf, setSelectedExamPdf] = useState(null);
  const [isRepoPickerOpen, setIsRepoPickerOpen] = useState(false);

  // Question Keys
  const [part1Keys, setPart1Keys] = useState(
    Array.from({ length: 18 }, (_, i) => ({
      questionNumber: i + 1,
      partType: "PART_1_ABCD",
      correctAnswer: "A",
      points: 0.25
    }))
  );

  const [part2Keys, setPart2Keys] = useState(
    Array.from({ length: 4 }, (_, i) => ({
      questionNumber: 18 + i + 1,
      partType: "PART_2_TRUE_FALSE",
      correctAnswer: "D,S,D,S",
      points: 1.0
    }))
  );

  const [part3Keys, setPart3Keys] = useState(
    Array.from({ length: 6 }, (_, i) => ({
      questionNumber: 22 + i + 1,
      partType: "PART_3_SHORT_ANSWER",
      correctAnswer: "",
      points: 0.25
    }))
  );

  const [activePartTab, setActivePartTab] = useState("PART_1");

  // Load Classes
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const clsList = await classService.getMyClasses();
        if (mounted) setClasses(Array.isArray(clsList) ? clsList : []);
      } catch {
        if (mounted) showToast("Không tải được danh sách lớp học", "error");
      } finally {
        if (mounted) setLoadingClasses(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [showToast]);

  // Handlers for Question Keys
  const handleUpdatePart1 = useCallback((index, field, value) => {
    setPart1Keys((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  }, []);

  const handleUpdatePart2 = useCallback((index, field, value) => {
    setPart2Keys((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  }, []);

  const handleUpdatePart3 = useCallback((index, field, value) => {
    setPart3Keys((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  }, []);

  // Selected Class Name
  const selectedClassName = useMemo(() => {
    const found = classes.find((c) => String(c.id) === String(classId));
    return found ? found.name : "";
  }, [classes, classId]);

  // Total Scores & Counts
  const totalScore = useMemo(() => {
    const s1 = part1Keys.reduce((acc, k) => acc + (Number(k.points) || 0), 0);
    const s2 = part2Keys.reduce((acc, k) => acc + (Number(k.points) || 0), 0);
    const s3 = part3Keys.reduce((acc, k) => acc + (Number(k.points) || 0), 0);
    return s1 + s2 + s3;
  }, [part1Keys, part2Keys, part3Keys]);

  const totalQuestions = part1Keys.length + part2Keys.length + part3Keys.length;

  // Submit Exam
  const handleSubmitExam = async () => {
    if (!title.trim()) {
      showToast("Vui lòng nhập tên đề thi", "error");
      setStep(1);
      return;
    }
    if (!classId) {
      showToast("Vui lòng chọn lớp học", "error");
      setStep(1);
      return;
    }
    // [FIX] Backend yêu cầu documentId @NotNull — bắt buộc chọn PDF từ kho
    if (!selectedDocId) {
      showToast("Vui lòng chọn file PDF đề thi từ Kho lưu trữ (Bước 1)", "error");
      setStep(1);
      return;
    }

    const emptyPart3 = part3Keys.filter(k => !k.correctAnswer || k.correctAnswer.trim() === "");
    if (emptyPart3.length > 0) {
      showToast(`Phần III còn ${emptyPart3.length} câu chưa nhập đáp án. Vui lòng điền đáp án hoặc nhập "0" nếu câu đó không có trong đề.`, "error");
      setStep(2);
      return;
    }

    // [FIX] Validate thời gian: Bắt đầu phải trước Kết thúc (BUG-04)
    if (startTime && endTime) {
      if (new Date(startTime) >= new Date(endTime)) {
        showToast("Thời gian bắt đầu phải trước thời gian kết thúc!", "error");
        setStep(1);
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        classId: Number(classId),
        documentId: Number(selectedDocId),
        durationMinutes: Number(durationMinutes),
        startTime: startTime ? `${startTime}:00` : null,
        endTime: endTime ? `${endTime}:00` : null,
        // [FIX] Thêm 3 trường bắt buộc mà backend yêu cầu (@NotNull @Min(0))
        part1Count: part1Keys.length,
        part2Count: part2Keys.length,
        part3Count: part3Keys.length,
        answerKeys: [...part1Keys, ...part2Keys, ...part3Keys]
      };

      await examService.createExam(payload);
      showToast("Tạo đề thi mới thành công!");
      navigate("/teacher/dashboard");
    } catch (err) {
      showToast(
        err.response?.data?.message || "Lỗi khi xuất bản bài thi.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingClasses) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Step Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Tạo Đề Thi Mới
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">
            Quy trình 3 bước soạn bài kiểm tra và đáp án ma trận
          </p>
        </div>

        {/* Wizard Steps indicator */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStep(1)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              step === 1
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-500"
            }`}
          >
            1. Thông tin
          </button>
          <button
            onClick={() => setStep(2)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              step === 2
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-500"
            }`}
          >
            2. Đáp án
          </button>
          <button
            onClick={() => setStep(3)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              step === 3
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-500"
            }`}
          >
            3. Xác nhận
          </button>
        </div>
      </div>

      {/* Step Content */}
      {step === 1 && (
        <ExamBasicInfoStep
          title={title}
          setTitle={setTitle}
          classId={classId}
          setClassId={setClassId}
          classes={classes}
          durationMinutes={durationMinutes}
          setDurationMinutes={setDurationMinutes}
          startTime={startTime}
          setStartTime={setStartTime}
          endTime={endTime}
          setEndTime={setEndTime}
          selectedExamPdf={selectedExamPdf}
          selectedDocId={selectedDocId}
          onOpenRepoPicker={() => setIsRepoPickerOpen(true)}
        />
      )}

      {step === 2 && (
        <QuestionEditorStep
          part1Count={part1Keys.length}
          part2Count={part2Keys.length}
          part3Count={part3Keys.length}
          part1Keys={part1Keys}
          part2Keys={part2Keys}
          part3Keys={part3Keys}
          onUpdatePart1={handleUpdatePart1}
          onUpdatePart2={handleUpdatePart2}
          onUpdatePart3={handleUpdatePart3}
          activePartTab={activePartTab}
          setActivePartTab={setActivePartTab}
        />
      )}

      {step === 3 && (
        <ExamPreviewStep
          title={title}
          className={selectedClassName}
          durationMinutes={durationMinutes}
          startTime={startTime}
          endTime={endTime}
          totalScore={totalScore}
          totalQuestions={totalQuestions}
          part1Count={part1Keys.length}
          part2Count={part2Keys.length}
          part3Count={part3Keys.length}
          selectedExamPdf={selectedExamPdf}
        />
      )}

      {/* Step Footer Navigation */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-extrabold text-xs rounded-xl flex items-center gap-2 cursor-pointer transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại
          </button>
        ) : (
          <div />
        )}

        {step < 3 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-sm transition-all"
          >
            Tiếp theo <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmitExam}
            disabled={submitting}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-md transition-all disabled:opacity-60"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Xuất Bản Bài Thi
          </button>
        )}
      </div>

      {/* Modal Chọn File PDF */}
      {isRepoPickerOpen && (
        <RepositoryPickerModal
          onSelect={(doc) => {
            setSelectedDocId(doc.id);
            setSelectedExamPdf(doc);
            setIsRepoPickerOpen(false);
            showToast(`Đã chọn PDF: ${doc.title || doc.fileName}`);
          }}
          onClose={() => setIsRepoPickerOpen(false)}
        />
      )}
    </div>
  );
}
