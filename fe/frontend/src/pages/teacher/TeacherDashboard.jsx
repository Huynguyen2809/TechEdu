import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import classService from "../../services/classService";
import authService from "../../services/authService";
import { useToast } from "../../context/ToastContext";
import {
  Users,
  FileText,
  Star,
  Plus,
  Zap,
  BookOpen,
  Award,
  X
} from "lucide-react";

const CARD =
  "bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm transition-all duration-150";
const CARD_HOVER = `${CARD} hover:-translate-y-1 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 group`;
const ICON_BOX =
  "w-12 h-12 rounded-xl flex items-center justify-center border border-slate-100 dark:border-slate-800/60 shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-105";

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [teacherName, setTeacherName] = useState("Thầy/Cô");
  const [classes, setClasses] = useState([]);
  const [examsList, setExamsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // State cho Modal tạo lớp nhanh
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [className, setClassName] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("Hóa học");
  const [gradeLevel, setGradeLevel] = useState(12);
  const [creatingClass, setCreatingClass] = useState(false);

  const fetchDashboardData = useCallback(async (isMounted) => {
    try {
      const [userProfile, classList] = await Promise.all([
        authService.getCurrentUser(),
        classService.getMyClasses()
      ]);

      const loadedClasses = Array.isArray(classList) ? classList : [];
      if (!isMounted()) return;

      setTeacherName(userProfile?.fullName || userProfile?.name || "Thầy/Cô");
      setClasses(loadedClasses);

      const examPromises = loadedClasses.map((cls) =>
        classService
          .getExamsForClass(cls.id)
          .then((exams) =>
            Array.isArray(exams)
              ? exams.map((e) => ({
                  ...e,
                  className: cls.name,
                  subjectName: cls.subjectName,
                  totalStudents: cls.studentCount || 0
                }))
              : []
          )
          .catch(() => [])
      );

      const examArrays = await Promise.all(examPromises);
      if (!isMounted()) return;

      setExamsList(examArrays.flat());
    } catch (error) {
      if (isMounted()) {
        console.error("Lỗi tải dữ liệu Dashboard:", error);
      }
    } finally {
      if (isMounted()) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const isMounted = () => mounted;
    fetchDashboardData(isMounted);
    return () => { mounted = false; };
  }, [fetchDashboardData]);

  const totalClasses = classes.length;
  const totalStudents = classes.reduce((acc, c) => acc + Number(c.studentCount || 0), 0);
  const totalExams = examsList.length;

  const totalSubmissions = examsList.reduce(
    (acc, e) => acc + Number(e.submissionCount || e.submittedCount || 0), 0
  );
  const totalPossible = examsList.reduce(
    (acc, e) => acc + Number(e.totalStudents || 0), 0
  );
  const submissionRate = totalPossible > 0 ? Math.round((totalSubmissions / totalPossible) * 100) : 0;

  const handleCreateQuickClass = async (e) => {
    e.preventDefault();
    if (!className.trim()) return;
    setCreatingClass(true);
    try {
      await classService.createClass({
        name: className.trim(),
        subjectName: selectedSubject,
        gradeLevel: Number(gradeLevel)
      });
      setClassName("");
      setIsClassModalOpen(false);
      showToast("Tạo lớp học mới thành công!");
      
      const updatedClasses = await classService.getMyClasses();
      setClasses(Array.isArray(updatedClasses) ? updatedClasses : []);
    } catch (err) {
      showToast(err.response?.data?.message || "Lỗi khi tạo lớp học", "error");
    } finally {
      setCreatingClass(false);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* BANNER CHÀO MỪNG (Glassmorphism & Gradient) */}
      <div className="relative rounded-3xl p-6 sm:p-8 text-white overflow-hidden shadow-lg border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 z-0"></div>
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none z-0"></div>
        <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-indigo-400/20 rounded-full blur-2xl pointer-events-none z-0"></div>

        <div className="relative z-10 space-y-2">
          <div className="bg-white/15 backdrop-blur-md text-white/90 border border-white/20 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full inline-flex items-center gap-1.5 shadow-sm">
            <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" /> CỔNG THÔNG TIN GIÁO VIÊN
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-2">
            Xin chào, {teacherName}
          </h1>
          <p className="text-indigo-100 text-sm font-medium max-w-xl leading-relaxed">
            Hãy bắt đầu quản lý lớp học và kiểm tra tiến độ làm bài của học sinh.
          </p>
        </div>

        <div className="relative z-10 shrink-0">
          <button
            onClick={() => navigate("/teacher/exams")}
            className="bg-white hover:bg-slate-50 text-indigo-700 font-bold px-5 py-3 rounded-xl text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>Tạo Đề Thi Nhanh</span>
          </button>
        </div>
      </div>

      {/* ── THỐNG KÊ NHANH ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Tổng Lớp Học */}
        <div className={`${CARD_HOVER} p-6 flex items-center justify-between hover:border-indigo-300 dark:hover:border-indigo-700/60`}>
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Lớp Học</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">{loading ? "..." : totalClasses}</span>
              <span className="text-xs font-semibold text-slate-500">lớp</span>
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Đang quản lý trực tiếp</p>
          </div>
          <div className={`${ICON_BOX} bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white border-indigo-100 dark:border-indigo-800/60 transition-colors`}>
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Học Sinh */}
        <div className={`${CARD_HOVER} p-6 flex items-center justify-between hover:border-sky-300 dark:hover:border-sky-700/60`}>
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Học Sinh</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">{loading ? "..." : totalStudents}</span>
              <span className="text-xs font-semibold text-slate-500">học sinh</span>
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Tổng số theo học</p>
          </div>
          <div className={`${ICON_BOX} bg-sky-50 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 group-hover:bg-sky-500 group-hover:text-white border-sky-100 dark:border-sky-800/60 transition-colors`}>
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Đề Thi & Bài Nộp */}
        <div className={`${CARD_HOVER} p-6 flex items-center justify-between hover:border-emerald-300 dark:hover:border-emerald-700/60`}>
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Đề Thi &amp; Bài Nộp</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">{loading ? "..." : totalExams}</span>
              <span className="text-xs font-semibold text-slate-500">đề / {totalSubmissions} nộp</span>
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {submissionRate > 0 ? `Tỷ lệ làm bài ${submissionRate}%` : "Chưa có bài nộp"}
            </p>
          </div>
          <div className={`${ICON_BOX} bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white border-emerald-100 dark:border-emerald-800/60 transition-colors`}>
            <FileText className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ── THAO TÁC NHANH ── */}
      <div>
        <h2 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 tracking-tight mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span>Thao Tác Nhanh</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Action 1: Tạo Đề Thi Mới */}
          <button
            onClick={() => navigate("/teacher/exams")}
            className={`${CARD_HOVER} p-5 text-left flex items-center gap-4 cursor-pointer w-full hover:border-indigo-400 dark:hover:border-indigo-600`}
          >
            <div className={`${ICON_BOX} bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white border-indigo-100 dark:border-indigo-800/60 transition-colors`}>
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-base text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors tracking-tight">
                Tạo Đề Thi Mới
              </p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                Soạn bài kiểm tra hoặc bài thi
              </p>
            </div>
          </button>

          {/* Action 2: Tạo Lớp Học Mới */}
          <button
            onClick={() => setIsClassModalOpen(true)}
            className={`${CARD_HOVER} p-5 text-left flex items-center gap-4 cursor-pointer w-full hover:border-amber-400 dark:hover:border-amber-600`}
          >
            <div className={`${ICON_BOX} bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500 group-hover:text-white border-amber-100 dark:border-amber-800/60 transition-colors`}>
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-base text-slate-800 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors tracking-tight">
                Tạo Lớp Học Mới
              </p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                Khởi tạo lớp học mới và thêm học sinh
              </p>
            </div>
          </button>

          {/* Action 3: Sổ Điểm & Báo Cáo */}
          <button
            onClick={() => navigate("/teacher/gradebook")}
            className={`${CARD_HOVER} p-5 text-left flex items-center gap-4 cursor-pointer w-full hover:border-emerald-400 dark:hover:border-emerald-600`}
          >
            <div className={`${ICON_BOX} bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white border-emerald-100 dark:border-emerald-800/60 transition-colors`}>
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-base text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors tracking-tight">
                Sổ Điểm
              </p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                Tra cứu kết quả rèn luyện học sinh
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* MODAL TẠO LỚP HỌC NHANH (Glassmorphism) */}
      {isClassModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl transition-all">
            {/* Header Modal */}
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white p-6 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-xl leading-tight tracking-tight">
                  Tạo Lớp Học Mới
                </h3>
                <p className="text-xs font-medium text-indigo-100 mt-1 opacity-90">
                  Hệ thống sinh tự động Mã Join Code 6 ký tự
                </p>
              </div>
              <button
                onClick={() => setIsClassModalOpen(false)}
                className="text-white/70 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuickClass} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Tên Lớp Học <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Lớp 12A1 - Ôn thi THPT"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-500/10 text-slate-800 dark:text-slate-100 font-semibold transition-all shadow-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Môn Học
                  </label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-500/10 text-slate-800 dark:text-slate-100 font-semibold cursor-pointer transition-all shadow-sm"
                  >
                    <option value="Hóa học">Hóa học</option>
                    <option value="Toán học">Toán học</option>
                    <option value="Vật lý">Vật lý</option>
                    <option value="Sinh học">Sinh học</option>
                    <option value="Tiếng Anh">Tiếng Anh</option>
                    <option value="Ngữ văn">Ngữ văn</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Khối Lớp
                  </label>
                  <select
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-500/10 text-slate-800 dark:text-slate-100 font-semibold cursor-pointer transition-all shadow-sm"
                  >
                    <option value={10}>Khối 10</option>
                    <option value={11}>Khối 11</option>
                    <option value={12}>Khối 12</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/60 mt-2">
                <button
                  type="button"
                  onClick={() => setIsClassModalOpen(false)}
                  className="bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl border border-slate-200 dark:border-slate-700 flex-1 py-2.5 px-4 text-sm cursor-pointer shadow-sm active:scale-[0.98] transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creatingClass}
                  className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-semibold rounded-xl flex-1 py-2.5 px-4 text-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-[0.98] transition-all"
                >
                  {creatingClass ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Đang xử lý</span>
                    </div>
                  ) : "Tạo Lớp Học"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
