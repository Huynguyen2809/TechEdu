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
  Award
} from "lucide-react";

const CARD =
  "bg-white dark:bg-slate-900 cyber:bg-white rounded-2xl border border-slate-200/80 dark:border-slate-800 cyber:border-2 cyber:border-slate-900 shadow-sm dark:shadow-none cyber:shadow-[3px_3px_0_0_#0f172a]";
const CARD_HOVER = `${CARD} hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group`;
const ICON_BOX =
  "w-10 h-10 rounded-xl flex items-center justify-center border border-slate-200/60 dark:border-slate-700/60 shrink-0 group-hover:scale-110 transition-transform duration-300";

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

  // 1. Tải dữ liệu Dashboard song song với Promise.all & cờ isMounted
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

      // Tải danh sách bài thi từ tất cả các lớp SONG SONG với Promise.all
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

    return () => {
      mounted = false;
    };
  }, [fetchDashboardData]);

  // Thống kê Live 100% Thực Tế
  const totalClasses = classes.length;
  const totalStudents = classes.reduce(
    (acc, c) => acc + Number(c.studentCount || 0),
    0
  );
  const totalExams = examsList.length;

  const totalSubmissions = examsList.reduce(
    (acc, e) => acc + Number(e.submissionCount || e.submittedCount || 0),
    0
  );
  const totalPossible = examsList.reduce(
    (acc, e) => acc + Number(e.totalStudents || 0),
    0
  );
  const submissionRate =
    totalPossible > 0 ? Math.round((totalSubmissions / totalPossible) * 100) : 0;

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
      
      // Reload classes
      const updatedClasses = await classService.getMyClasses();
      setClasses(Array.isArray(updatedClasses) ? updatedClasses : []);
    } catch (err) {
      showToast(
        err.response?.data?.message || "Lỗi khi tạo lớp học",
        "error"
      );
    } finally {
      setCreatingClass(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* BANNER CHÀO MỪNG */}
      <div className="bg-indigo-600 rounded-2xl p-5 md:p-6 text-white shadow-md cyber:shadow-[6px_6px_0_0_#0f172a] cyber:border-2 cyber:border-slate-900 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative z-10 space-y-1">
          <div className="bg-white/15 backdrop-blur-md text-white/90 border border-white/20 text-[11px] font-semibold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
            <Star className="w-3 h-3 text-amber-300 fill-amber-300" /> CỔNG THÔNG TIN GIÁO VIÊN
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            Xin chào, {teacherName}
          </h1>
          <p className="text-indigo-100 text-xs font-medium max-w-xl">
            Hãy bắt đầu quản lý lớp học và kiểm tra tiến độ làm bài của học sinh.
          </p>
        </div>

        <div className="relative z-10 shrink-0">
          <button
            onClick={() => navigate("/teacher/exams")}
            className="bg-white text-indigo-900 hover:bg-indigo-50 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap cyber:bg-white cyber:text-slate-900 cyber:border-2 cyber:border-slate-900 cyber:shadow-[3px_3px_0_0_#0f172a] cyber:hover:translate-x-0.5 cyber:hover:translate-y-0.5 cyber:hover:shadow-none"
          >
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>Tạo Đề Thi Nhanh</span>
          </button>
        </div>
      </div>

      {/* ── THỐNG KÊ NHANH ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Tổng Lớp Học */}
        <div className={`${CARD_HOVER} p-4 flex items-center justify-between hover:border-indigo-400 dark:hover:border-indigo-600`}>
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Lớp Học</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-800 dark:text-slate-100 cyber:text-slate-900 tracking-tight">{loading ? "..." : totalClasses}</span>
              <span className="text-xs font-semibold text-slate-500">lớp</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Đang quản lý trực tiếp</p>
          </div>
          <div className={`${ICON_BOX} bg-indigo-50 dark:bg-indigo-950/60 cyber:bg-indigo-100 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/60 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300`}>
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Học Sinh */}
        <div className={`${CARD_HOVER} p-4 flex items-center justify-between hover:border-sky-400 dark:hover:border-sky-600`}>
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Học Sinh</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-800 dark:text-slate-100 cyber:text-slate-900 tracking-tight">{loading ? "..." : totalStudents}</span>
              <span className="text-xs font-semibold text-slate-500">học sinh</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Tổng số theo học</p>
          </div>
          <div className={`${ICON_BOX} bg-sky-50 dark:bg-sky-950/60 cyber:bg-sky-100 text-sky-600 dark:text-sky-400 border-sky-100 dark:border-sky-900/60 group-hover:scale-110 group-hover:bg-sky-500 group-hover:text-white transition-all duration-300`}>
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Đề Thi & Bài Nộp */}
        <div className={`${CARD_HOVER} p-4 flex items-center justify-between hover:border-emerald-400 dark:hover:border-emerald-600`}>
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Đề Thi &amp; Bài Nộp</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-800 dark:text-slate-100 cyber:text-slate-900 tracking-tight">{loading ? "..." : totalExams}</span>
              <span className="text-xs font-semibold text-slate-500">đề / {totalSubmissions} nộp</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              {submissionRate > 0 ? `Tỷ lệ làm bài ${submissionRate}%` : "Chưa có bài nộp"}
            </p>
          </div>
          <div className={`${ICON_BOX} bg-emerald-50 dark:bg-emerald-950/60 cyber:bg-emerald-100 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/60 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300`}>
            <FileText className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── THAO TÁC NHANH ── */}
      <div>
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 cyber:text-slate-900 tracking-tight mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span>Thao Tác Nhanh</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Action 1: Tạo Đề Thi Mới */}
          <button
            onClick={() => navigate("/teacher/exams")}
            className={`${CARD_HOVER} p-4 text-left flex items-center gap-3.5 cursor-pointer w-full hover:border-indigo-500 dark:hover:border-indigo-500`}
          >
            <div className={`${ICON_BOX} bg-indigo-50 dark:bg-indigo-950/60 cyber:bg-indigo-100 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/60 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300`}>
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <p className="font-extrabold text-sm text-slate-800 dark:text-slate-100 cyber:text-slate-900 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Tạo Đề Thi Mới
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Soạn bài kiểm tra hoặc bài thi
              </p>
            </div>
          </button>

          {/* Action 2: Tạo Lớp Học Mới */}
          <button
            onClick={() => setIsClassModalOpen(true)}
            className={`${CARD_HOVER} p-4 text-left flex items-center gap-3.5 cursor-pointer w-full hover:border-amber-500 dark:hover:border-amber-500`}
          >
            <div className={`${ICON_BOX} bg-amber-50 dark:bg-amber-950/60 cyber:bg-amber-100 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/60 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300`}>
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <p className="font-extrabold text-sm text-slate-800 dark:text-slate-100 cyber:text-slate-900 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Tạo Lớp Học Mới
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Khởi tạo lớp học mới và thêm học sinh
              </p>
            </div>
          </button>

          {/* Action 3: Sổ Điểm & Báo Cáo */}
          <button
            onClick={() => navigate("/teacher/gradebook")}
            className={`${CARD_HOVER} p-4 text-left flex items-center gap-3.5 cursor-pointer w-full hover:border-emerald-500 dark:hover:border-emerald-500`}
          >
            <div className={`${ICON_BOX} bg-emerald-50 dark:bg-emerald-950/60 cyber:bg-emerald-100 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/60 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300`}>
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="font-extrabold text-sm text-slate-800 dark:text-slate-100 cyber:text-slate-900 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Sổ Điểm
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Tra cứu kết quả rèn luyện học sinh
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* MODAL TẠO LỚP HỌC NHANH */}
      {isClassModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full overflow-hidden border border-slate-100 dark:border-slate-800 shadow-2xl cyber:bg-white cyber:border-2 cyber:border-slate-900 cyber:shadow-[6px_6px_0_0_#0f172a] cyber:rounded-2xl">
            {/* Header Modal */}
            <div className="bg-indigo-600 text-white p-6 flex items-center justify-between border-b border-indigo-700 dark:border-slate-800 cyber:border-b-2 cyber:border-slate-900">
              <div>
                <h3 className="font-extrabold text-lg leading-tight tracking-tight text-white">
                  Tạo Lớp Học Mới
                </h3>
                <p className="text-xs text-indigo-100 mt-0.5">
                  Hệ thống sinh tự động Mã Join Code 6 ký tự
                </p>
              </div>
              <button
                onClick={() => setIsClassModalOpen(false)}
                className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <span className="text-lg font-bold">✕</span>
              </button>
            </div>

            <form onSubmit={handleCreateQuickClass} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Tên Lớp Học <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Lớp 12A1 - Ôn thi THPT"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full px-4 py-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Môn Học
                  </label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full px-3 py-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 font-semibold text-slate-800 dark:text-slate-100 cursor-pointer"
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
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Khối Lớp
                  </label>
                  <select
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                    className="w-full px-3 py-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 font-semibold text-slate-800 dark:text-slate-100 cursor-pointer"
                  >
                    <option value={10}>Khối 10</option>
                    <option value={11}>Khối 11</option>
                    <option value={12}>Khối 12</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2 mt-6">
                <button
                  type="button"
                  onClick={() => setIsClassModalOpen(false)}
                  className="bg-white dark:bg-slate-800 cyber:bg-white hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl border border-slate-200 dark:border-slate-700 flex-1 py-2.5 px-4 text-sm cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creatingClass}
                  className="bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 text-white font-semibold rounded-xl flex-1 py-2.5 px-4 text-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {creatingClass ? "Đang xử lý..." : "Tạo Lớp Học"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
