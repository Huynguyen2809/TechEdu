import React from "react";
import {
  Users,
  Calendar,
  Edit3,
  Check,
  Copy
} from "lucide-react";

export default function ClassHeaderBanner({
  classInfo,
  memberCount,
  copiedCode,
  onCopyCode,
  onOpenEditModal
}) {
  if (!classInfo) return null;

  return (
    <div className="bg-indigo-600 rounded-2xl p-5 md:p-6 text-white shadow-md cyber:shadow-[6px_6px_0_0_#0f172a] cyber:border-2 cyber:border-slate-900 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="relative z-10 space-y-2 max-w-3xl">
        <div className="flex items-center gap-2">
          <span className="px-3 py-0.5 rounded-full bg-white/10 text-white text-[11px] font-semibold uppercase tracking-wider backdrop-blur-xs">
            {classInfo.subjectName || "Hóa học"} • Khối{" "}
            {classInfo.gradeLevel || "12"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
            {classInfo.name}
          </h1>
          <button
            onClick={onOpenEditModal}
            className="p-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors cursor-pointer"
            title="Đổi tên lớp học"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs sm:text-sm text-blue-100 flex items-center gap-4 pt-1 font-medium">
          <span className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-amber-300" />
            <b>{memberCount}</b> Học sinh trong lớp
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-blue-200" /> Ngày tạo:{" "}
            {classInfo.createdAt
              ? new Date(classInfo.createdAt).toLocaleDateString("vi-VN")
              : "Gần đây"}
          </span>
        </p>
      </div>

      {/* Hộp hiển thị và Copy Join Code */}
      <div className="relative z-10 w-full md:w-auto bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center justify-between gap-6 shadow-inner">
        <div>
          <div className="text-[10px] font-bold uppercase text-blue-100 tracking-wider">
            Mã gia nhập lớp (Join Code)
          </div>
          <div className="text-2xl font-mono font-extrabold text-amber-300 tracking-widest mt-0.5">
            {classInfo.joinCode}
          </div>
        </div>

        <button
          onClick={() => onCopyCode(classInfo.joinCode)}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
            copiedCode === classInfo.joinCode
              ? "bg-green-600 text-white shadow-md"
              : "bg-white text-indigo-700 hover:bg-blue-50 shadow-sm"
          }`}
        >
          {copiedCode === classInfo.joinCode ? (
            <>
              <Check className="w-4 h-4" />
              <span>Đã sao chép!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Sao chép mã</span>
            </>
          )}
        </button>
      </div>

      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-400/20 rounded-full pointer-events-none blur-[60px] -translate-y-1/2 translate-x-1/3"></div>
    </div>
  );
}
