import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import classService from "../../services/classService";
import {
  BookOpen,
  User,
  AlertCircle,
  Flame,
  ArrowRight,
  Plus,
  X,
  Check
} from "lucide-react";

// ── Shared Clean UI tokens ──────────────────────────────────────
const CARD = "bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm";
const CARD_HOVER = `${CARD} hover:-translate-y-1 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 group`;
const BTN_PRIMARY = "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-semibold rounded-xl shadow-sm hover:shadow-md active:scale-[0.98] transition-all cursor-pointer";
const BTN_SECONDARY = "bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 font-semibold rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2";

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

      const examsResults = await Promise.all(
        classList.map(cls =>
          classService.getExamsForClass(cls.id)
            .then(exams => ({ id: cls.id, exams: Array.isArray(exams) ? exams : [] }))
            .catch(err => { console.error(`Không thể tải bài thi của lớp ${cls.id}:`, err); return { id: cls.id, exams: [] }; })
        )
      );

      if (!mounted) return;
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
          className={`${BTN_PRIMARY} px-5 py-2.5 flex items-center justify-center gap-2 text-sm whitespace-nowrap`}
        >
          <Plus className="w-4 h-4 text-amber-300" />
          <span>Tham Gia Lớp Mới</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/60 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl h-[240px] w-full border border-slate-200/60 dark:border-slate-800/60 p-6 flex flex-col justify-between">
              <div className="space-y-4">
                 <div className="flex justify-between"><div className="w-20 h-5 bg-slate-200 dark:bg-slate-800 rounded-md"></div><div className="w-16 h-5 bg-slate-200 dark:bg-slate-800 rounded-md"></div></div>
                 <div className="w-3/4 h-6 bg-slate-200 dark:bg-slate-800 rounded-md mt-2"></div>
                 <div className="w-1/2 h-4 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
                 <div className="w-1/3 h-4 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
              </div>
              <div className="w-full h-10 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : classes.length === 0 ? (
        <div className={`${CARD} flex flex-col items-center py-24 gap-4 bg-slate-50/50 dark:bg-slate-900/50 border-dashed`}>
          <div className="w-16 h-16 bg-white dark:bg-slate-800 text-indigo-400 dark:text-indigo-500 rounded-2xl flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm">
            <BookOpen className="w-8 h-8" />
          </div>
          <div className="text-center max-w-sm">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">
              Bạn chưa tham gia lớp học nào
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
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
                    <span className="text-[11px] font-bold uppercase px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 border border-sky-100 dark:border-sky-800/60 shadow-sm">
                      {cls.subjectName || "Hóa học"}
                    </span>
                    <span className="text-[11px] font-bold uppercase px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm">
                      Khối {cls.gradeLevel || "12"}
                    </span>
                  </div>

                  {/* Tên Lớp */}
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                      {cls.name}
                    </h3>
                  </div>

                  {/* Thông tin giáo viên & số bài chưa làm */}
                  <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800/60 text-sm font-medium text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400" />
                      <span>Giáo viên: </span>
                      <strong className="text-slate-700 dark:text-slate-200 font-bold">{cls.teacherName || "Giáo viên bộ môn"}</strong>
                    </div>

                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <span>Bài thi chưa làm: </span>
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${pendingCount > 0
                        ? "bg-orange-50 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800/60"
                        : "bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60"
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

      {/* MODAL NHẬP MÃ THAM GIA (Glassmorphism) */}
      {isJoinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200 dark:border-slate-800 transform transition-all">
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white p-6 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-xl leading-tight tracking-tight">
                  Tham Gia Lớp Học
                </h3>
                <p className="text-xs font-medium text-indigo-100 mt-1 opacity-90">
                  Nhận mã lớp từ giáo viên
                </p>
              </div>
              <button
                onClick={() => setIsJoinModalOpen(false)}
                className="text-white/70 hover:text-white hover:bg-white/10 p-1.5 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleJoinClassSubmit} className="p-6 space-y-6">
              {joinError && (
                <div className="p-3.5 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800/60 rounded-xl text-rose-600 dark:text-rose-400 text-sm flex items-center gap-2.5 font-semibold shadow-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{joinError}</span>
                </div>
              )}

              {joinSuccess && (
                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-emerald-700 dark:text-emerald-400 text-sm flex items-center gap-2.5 font-semibold shadow-sm">
                  <Check className="w-5 h-5 shrink-0" />
                  <span>Gia nhập lớp học thành công!</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Mã Lớp Học (6-10 ký tự)
                </label>
                <input
                  type="text"
                  maxLength={10}
                  placeholder="Nhập mã lớp..."
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3.5 bg-slate-50/50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl font-mono text-center tracking-[0.2em] text-xl font-bold text-slate-900 dark:text-slate-100 uppercase focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-sm focus:shadow-md focus:ring-4 focus:ring-indigo-500/10"
                  required
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsJoinModalOpen(false)}
                  className={`${BTN_SECONDARY} flex-1 py-3 text-sm`}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={joinSubmitting}
                  className={`${BTN_PRIMARY} flex-1 py-3 flex items-center justify-center text-sm disabled:opacity-70`}
                >
                  {joinSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Đang xử lý</span>
                    </div>
                  ) : "Tham Gia"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
