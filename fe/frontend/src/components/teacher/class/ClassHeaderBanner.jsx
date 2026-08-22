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
    <div className="relative rounded-3xl p-6 md:p-8 text-white overflow-hidden shadow-lg border border-teal-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-all">
      <div className="absolute inset-0 bg-gradient-to-br from-teal-600 via-teal-700 to-violet-800 z-0"></div>
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none z-0"></div>
      <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-teal-400/20 rounded-full blur-2xl pointer-events-none z-0"></div>

      <div className="relative z-10 space-y-3 max-w-3xl">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold uppercase tracking-wider shadow-sm">
            {classInfo.subjectName || "Hóa học"} • Khối{" "}
            {classInfo.gradeLevel || "12"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
            {classInfo.name}
          </h1>
          <button
            onClick={onOpenEditModal}
            className="p-2 bg-white/10 hover:bg-white/25 rounded-xl text-white transition-colors cursor-pointer border border-white/10 shadow-sm"
            title="Đổi tên lớp học"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-teal-100 flex items-center gap-4 pt-1 font-medium">
          <span className="flex items-center gap-2">
            <Users className="w-4.5 h-4.5 text-amber-300" />
            <b className="text-white">{memberCount}</b> Học sinh trong lớp
          </span>
          <span className="text-white/50">•</span>
          <span className="flex items-center gap-2">
            <Calendar className="w-4.5 h-4.5 text-teal-300" /> Ngày tạo:{" "}
            <span className="text-white">
              {classInfo.createdAt
                ? new Date(classInfo.createdAt).toLocaleDateString("vi-VN")
                : "Gần đây"}
            </span>
          </span>
        </p>
      </div>

      {/* Hộp hiển thị và Copy Join Code (Glassmorphism) */}
      <div className="relative z-10 w-full sm:w-auto bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 flex flex-col items-center justify-between gap-3 shadow-inner">
        <div className="text-center w-full">
          <div className="text-[10px] font-bold uppercase text-teal-100 tracking-wider">
            Mã gia nhập lớp (Join Code)
          </div>
          <div className="text-3xl font-mono font-black text-amber-300 tracking-widest mt-1">
            {classInfo.joinCode}
          </div>
        </div>

        <button
          onClick={() => onCopyCode(classInfo.joinCode)}
          className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-[0.98] ${
            copiedCode === classInfo.joinCode
              ? "bg-emerald-500 hover:bg-emerald-600 text-white border border-emerald-400"
              : "bg-white hover:bg-teal-50 text-teal-700 border border-white"
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
    </div>
  );
}
