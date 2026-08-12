import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import classService from "../../services/classService";
import {
  BookOpen,
  User,
  FolderOpen,
  AlertCircle,
  Flame,
  ArrowRight,
  Plus,
  X,
  Check
} from "lucide-react";

// ── Shared tri-theme tokens ──────────────────────────────────────
const CARD = "bg-white dark:bg-slate-900 cyber:bg-white rounded-2xl border border-slate-200/80 dark:border-slate-800 cyber:border-2 cyber:border-slate-900 shadow-sm dark:shadow-none cyber:shadow-[4px_4px_0_0_#0f172a]";
const CARD_HOVER = `${CARD} hover:-translate-y-0.5 hover:shadow-md dark:hover:shadow-none cyber:hover:shadow-[6px_6px_0_0_#0f172a] cyber:hover:translate-y-0 transition-all duration-150`;
const BTN_PRIMARY = "bg-indigo-600 dark:bg-indigo-500 cyber:bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-400 cyber:hover:bg-indigo-500 text-white font-semibold rounded-xl border border-transparent cyber:border-2 cyber:border-slate-900 shadow-sm cyber:shadow-[3px_3px_0_0_#0f172a] cyber:active:translate-x-0.5 cyber:active:translate-y-0.5 cyber:active:shadow-none transition-all cursor-pointer";
const BTN_SECONDARY = "bg-white dark:bg-slate-800 cyber:bg-white hover:bg-slate-50 dark:hover:bg-slate-700 cyber:hover:bg-slate-100 text-slate-700 dark:text-slate-200 cyber:text-slate-900 font-semibold rounded-xl border border-slate-200 dark:border-slate-700 cyber:border-2 cyber:border-slate-900 shadow-sm cyber:shadow-[2px_2px_0_0_#0f172a] cyber:active:translate-x-0.5 cyber:active:translate-y-0.5 cyber:active:shadow-none transition-all cursor-pointer";

export default function MyClasses() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [classExamsData, setClassExamsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [joinSubmitting, setJoinSubmitting] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [joinSuccess, setJoinSuccess] = useState(false);

  const fetchMyClassesAndExams = useCallback(async () => {
    let mounted = true;
    setLoading(true);
    setError("");
    try {
      const data = await classService.getMyClasses();
      const classList = Array.isArray(data) ? data : [];

      // BUG-04: Chuyển for...of sang Promise.all() tải song song
      const examsResults = await Promise.all(
        classList.map(cls =>
          classService.getExamsForClass(cls.id)
            .then(exams => ({ id: cls.id, exams: Array.isArray(exams) ? exams : [] }))
            .catch(err => { console.error(`Không thể tải bài thi của lớp ${cls.id}:`, err); return { id: cls.id, exams: [] }; })
        )
      );

      if (!mounted) return; // BUG-06: Kiểm tra isMounted
      setClasses(classList);
      const examsMap = {};
      examsResults.forEach(({ id, exams }) => { examsMap[id] = exams; });
      setClassExamsData(examsMap);
    } catch (err) {
      console.error("Lỗi tải lớp:", err);
      if (mounted) setError("Không thể tải danh sách lớp học. Vui lòng thử lại sau.");
    } finally {
      if (mounted) setLoading(false);
    }
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    fetchMyClassesAndExams();
  }, [fetchMyClassesAndExams]);

  const handleJoinClassSubmit = async (e) => {
    e.preventDefault();
    setJoinError("");

    if (!joinCode.trim()) {
      setJoinError("Vui lòng nhập mã tham gia lớp học.");
      return;
    }

    setJoinSubmitting(true);
    try {
      await classService.joinClassByCode(joinCode.trim());
      setJoinSuccess(true);
      setTimeout(() => {
        setIsJoinModalOpen(false);
        setJoinCode("");
        setJoinSuccess(false);
        fetchMyClassesAndExams();
      }, 1500);
    } catch (err) {
      console.error("Lỗi gia nhập lớp:", err);
      setJoinError(
        err.response?.data?.message ||
        "Mã lớp không hợp lệ hoặc bạn đã tham gia lớp này rồi."
      );
    } finally {
      setJoinSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header trang */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
          <BookOpen className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
          <span>Lớp học của bạn</span>
        </h1>
        <button
          onClick={() => {
            setJoinCode("");
            setJoinError("");
            setJoinSuccess(false);
            setIsJoinModalOpen(true);
          }}
          className={`${BTN_PRIMARY} px-5 py-2.5 flex items-center gap-2 text-sm whitespace-nowrap`}
        >
          <Plus className="w-4 h-4 text-amber-300" />
          <span>Tham Gia Lớp Mới</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-600 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
            Đang tải danh sách lớp học...
          </p>
        </div>
      ) : classes.length === 0 ? (
        <div className={`${CARD} flex flex-col items-center py-20 gap-4`}>
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/60 cyber:bg-blue-100 text-indigo-600 dark:text-blue-400 rounded-2xl flex items-center justify-center border border-slate-200 dark:border-blue-900/60 cyber:border-2 cyber:border-slate-900 shadow-sm cyber:shadow-[2px_2px_0_0_#0f172a]">
            <BookOpen className="w-8 h-8" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Bạn chưa tham gia lớp học nào
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mt-1">
              Nhập mã gia nhập do giáo viên bộ môn cung cấp để bắt đầu học tập và làm bài thi.
            </p>
          </div>
          <button
            onClick={() => {
              setJoinCode("");
              setJoinError("");
              setJoinSuccess(false);
              setIsJoinModalOpen(true);
            }}
            className={`${BTN_PRIMARY} mt-2 px-6 py-2.5 text-sm inline-flex items-center gap-2`}
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>Nhập Mã Tham Gia Ngay</span>
          </button>
        </div>
      ) : (
        /* Lưới Card Lớp Học */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => {
            const exams = classExamsData[cls.id] || [];
            const now = new Date();
            const pendingCount = exams.filter((e) => !e.hasSubmitted && new Date(e.endTime) > now).length;

            return (
              <div
                key={cls.id}
                className={`${CARD_HOVER} p-6 flex flex-col justify-between space-y-6 group`}
              >
                <div className="space-y-4">
                  {/* Top Badge Môn & Khối */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase px-3 py-1 rounded-lg bg-sky-50 dark:bg-blue-950/60 cyber:bg-sky-300 text-sky-700 dark:text-blue-300 cyber:text-slate-900 border border-sky-200 dark:border-blue-900/60 cyber:border-2 cyber:border-slate-900 cyber:shadow-[2px_2px_0_0_#0f172a]">
                      {cls.subjectName || "Hóa học"}
                    </span>
                    <span className="text-xs font-semibold uppercase px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 cyber:bg-slate-200 text-slate-600 dark:text-slate-300 cyber:text-slate-900 border border-slate-200 dark:border-slate-700 cyber:border-2 cyber:border-slate-900 cyber:shadow-[2px_2px_0_0_#0f172a]">
                      Khối {cls.gradeLevel || "12"}
                    </span>
                  </div>

                  {/* Tên Lớp */}
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                      {cls.name}
                    </h3>
                  </div>

                  {/* Thông tin giáo viên & số bài chưa làm */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 cyber:border-t-2 cyber:border-slate-900 text-xs font-medium text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                      <span>Giáo viên: </span>
                      <strong className="text-slate-800 dark:text-slate-100 font-bold">{cls.teacherName || "Giáo viên bộ môn"}</strong>
                    </div>

                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                      <span>Bài thi chưa làm: </span>
                      <span className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold border ${pendingCount > 0
                        ? "bg-amber-50 dark:bg-amber-950/80 cyber:bg-amber-300 text-amber-700 dark:text-amber-300 cyber:text-slate-900 border-amber-200 dark:border-amber-800/80 cyber:border-2 cyber:border-slate-900"
                        : "bg-emerald-50 dark:bg-emerald-950/80 cyber:bg-emerald-300 text-emerald-700 dark:text-emerald-300 cyber:text-slate-900 border-emerald-200 dark:border-emerald-800/80 cyber:border-2 cyber:border-slate-900"
                        }`}>
                        {pendingCount} bài
                      </span>
                    </div>
                  </div>
                </div>

                {/* Nút Vào Lớp Học */}
                <button
                  onClick={() => navigate(`/student/classes/${cls.id}`)}
                  className={`${BTN_PRIMARY} py-2.5 px-4 w-full flex items-center justify-center gap-2`}
                >
                  <span>Vào Lớp Học</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL NHẬP MÃ THAM GIA */}
      {isJoinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 cyber:bg-white rounded-3xl shadow-xl cyber:shadow-[8px_8px_0_0_#0f172a] max-w-sm w-full overflow-hidden border border-slate-200 dark:border-slate-800 cyber:border-2 cyber:border-slate-900">
            <div className="bg-indigo-600 text-white p-6 flex items-center justify-between border-b border-indigo-700 dark:border-slate-800 cyber:border-b-2 cyber:border-slate-900">
              <div>
                <h3 className="font-extrabold text-lg leading-tight tracking-tight">
                  Tham Gia Lớp Học
                </h3>
                <p className="text-xs text-indigo-100 mt-0.5">
                  Nhận mã lớp từ giáo viên
                </p>
              </div>
              <button
                onClick={() => setIsJoinModalOpen(false)}
                className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleJoinClassSubmit} className="p-6 space-y-5">
              {joinError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800/80 cyber:border-2 cyber:border-slate-900 rounded-xl text-red-600 dark:text-red-400 text-xs flex items-center gap-2 font-semibold">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{joinError}</span>
                </div>
              )}

              {joinSuccess && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 cyber:bg-emerald-50 border border-emerald-200 dark:border-emerald-800/80 cyber:border-2 cyber:border-slate-900 rounded-xl text-emerald-700 dark:text-emerald-400 cyber:text-emerald-700 text-xs flex items-center gap-2 font-semibold">
                  <Check className="w-4 h-4 flex-shrink-0" />
                  <span>Gia nhập lớp học thành công!</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Mã Lớp Học
                </label>
                <input
                  type="text"
                  maxLength={10}
                  placeholder="......"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/60 cyber:bg-slate-50 border border-slate-200 dark:border-slate-700 cyber:border-2 cyber:border-slate-900 rounded-xl font-mono text-center tracking-widest text-lg font-bold text-slate-900 dark:text-slate-100 uppercase focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 cyber:focus:border-indigo-600 transition-all cyber:shadow-[2px_2px_0_0_#0f172a]"
                  required
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsJoinModalOpen(false)}
                  className={`${BTN_SECONDARY} flex-1 py-2.5 px-4 text-sm`}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={joinSubmitting}
                  className={`${BTN_PRIMARY} flex-1 py-2.5 px-4 text-sm disabled:opacity-50`}
                >
                  {joinSubmitting ? "Đang xử lý..." : "Tham Gia"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
