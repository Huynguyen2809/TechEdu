import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import classService from "../../services/classService";
import {
  Clock,
  FileText,
  CheckCircle2,
  PlayCircle,
  AlertCircle,
  ArrowLeft,
  Calendar,
  ShieldAlert,
} from "lucide-react";

export default function UpcomingExams() {
  const [searchParams] = useSearchParams();
  const classId = searchParams.get("classId");
  const navigate = useNavigate();

  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    const fetchExams = async () => {
      if (!classId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await classService.getExamsForClass(classId);
        if (mounted) setExams(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Lỗi tải bài thi:", err);
        if (mounted) setError(
          err.response?.data?.message ||
            "Không thể lấy danh sách bài kiểm tra.",
        );
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchExams();
    return () => { mounted = false; };
  }, [classId]);

  return (
    <div className="space-y-8 font-sans">
        <div>
          <button
            onClick={() => navigate("/student/my-classes")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-900 dark:text-slate-200 border-2 border-slate-900 dark:border-slate-700 rounded-xl font-bold text-sm shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-none active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại Danh sách lớp</span>
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border-2 border-slate-900 dark:border-slate-800 shadow-[4px_4px_0px_0px_#0f172a] dark:shadow-none flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-3 tracking-tight">
              <Clock className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              Bài Kiểm Tra Trực Tuyến
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mt-1">
              Danh sách các bài thi trắc nghiệm mở đếm ngược dành cho lớp học
              của bạn.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950/60 border-2 border-slate-900 dark:border-red-800/80 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm font-bold">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center space-y-3 bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-900 dark:border-slate-800 shadow-[4px_4px_0px_0px_#0f172a] dark:shadow-none">
            <div className="w-10 h-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
              Đang kiểm tra lịch thi từ máy chủ...
            </p>
          </div>
        ) : exams.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-900 dark:border-slate-800 p-12 text-center max-w-lg mx-auto space-y-3 shadow-[4px_4px_0px_0px_#0f172a] dark:shadow-none">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-950/60 text-indigo-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto border-2 border-slate-900 dark:border-blue-900/60 shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-none">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Không có bài kiểm tra nào
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
              Giáo viên hiện chưa phát hành đề thi mới cho lớp học này.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((exam) => {
              const now = new Date();
              const start = new Date(exam.startTime);
              const end = new Date(exam.endTime);

              const isUpcoming = now < start;
              const isClosed = now > end;
              const isOpen = now >= start && now <= end;

              return (
                <div
                  key={exam.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-900 dark:border-slate-800 p-6 shadow-[4px_4px_0px_0px_#0f172a] dark:shadow-none hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#0f172a] dark:hover:shadow-none transition-all space-y-5 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase px-3 py-1 rounded-lg bg-sky-300 dark:bg-blue-950/60 text-slate-900 dark:text-blue-300 border-2 border-slate-900 dark:border-blue-900/60 shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-none">
                        {exam.durationMinutes} Phút làm bài
                      </span>

                      {exam.hasSubmitted ? (
                        <span className="text-xs font-bold text-slate-900 dark:text-emerald-400 bg-emerald-300 dark:bg-emerald-950/80 px-3 py-1 rounded-lg border-2 border-slate-900 dark:border-emerald-800/80 flex items-center gap-1 shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-none">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Đã nộp bài
                        </span>
                      ) : isOpen ? (
                        <span className="text-xs font-bold text-slate-900 dark:text-amber-300 bg-amber-300 dark:bg-amber-950/80 px-3 py-1 rounded-lg border-2 border-slate-900 dark:border-amber-800/80 animate-pulse shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-none">
                          ● Đang diễn ra
                        </span>
                      ) : isUpcoming ? (
                        <span className="text-xs font-bold text-slate-900 dark:text-blue-300 bg-blue-300 dark:bg-blue-950/80 px-3 py-1 rounded-lg border-2 border-slate-900 dark:border-blue-800/80 shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-none">
                          Chưa mở
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-400 bg-slate-200 dark:bg-slate-800 px-3 py-1 rounded-lg border-2 border-slate-900 dark:border-slate-700 shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-none">
                          Đã đóng đề
                        </span>
                      )}
                    </div>

                    <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-lg leading-snug tracking-tight">
                      {exam.title}
                    </h3>

                    <div className="text-xs font-medium text-slate-600 dark:text-slate-400 space-y-1 pt-1">
                      <p className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" /> Bắt
                        đầu:{" "}
                        <b className="text-slate-900 dark:text-slate-200 font-extrabold">
                          {new Date(exam.startTime).toLocaleString("vi-VN")}
                        </b>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />{" "}
                        Kết thúc:{" "}
                        <b className="text-slate-900 dark:text-slate-200 font-extrabold">{new Date(exam.endTime).toLocaleString("vi-VN")}</b>
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t-2 border-slate-900 dark:border-slate-800">
                    {exam.hasSubmitted ? (
                      <button
                        onClick={() => navigate(`/student/history`)}
                        className="w-full bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-200 border-2 border-slate-900 dark:border-slate-700 font-bold py-2.5 rounded-xl text-sm shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-none active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                      >
                        Xem Lại Lời Giải
                      </button>
                    ) : isOpen ? (
                      <button
                        onClick={() => navigate(`/student/exam/${exam.id}`)}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-bold py-3 rounded-xl border-2 border-slate-900 dark:border-indigo-500 shadow-[3px_3px_0px_0px_#0f172a] dark:shadow-none active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
                      >
                        <PlayCircle className="w-5 h-5 text-amber-300" />
                        <span>Vào Phòng Thi Ngay</span>
                      </button>
                    ) : isUpcoming ? (
                      <button
                        disabled
                        className="w-full bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-500 border-2 border-slate-900 dark:border-slate-700 font-bold py-2.5 rounded-xl text-sm cursor-not-allowed"
                      >
                        Chưa Đến Giờ Thi
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-500 border-2 border-slate-900 dark:border-slate-700 font-bold py-2.5 rounded-xl text-sm cursor-not-allowed"
                      >
                        Đã Hết Hạn Làm Bài
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
    </div>
  );
}
