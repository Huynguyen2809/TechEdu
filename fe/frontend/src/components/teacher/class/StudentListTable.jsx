import React from "react";
import {
  GraduationCap,
  Search,
  Users,
  UserMinus,
  ShieldCheck,
  X
} from "lucide-react";

export default function StudentListTable({
  members,
  filteredMembers,
  searchTerm,
  setSearchTerm,
  joinCode,
  onOpenRemoveModal
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs dark:shadow-none overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-6 sm:p-8 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Danh Sách Học Sinh
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Quản lý danh sách các học sinh đã nhập mã tham gia vào lớp học này.
          </p>
        </div>

        {/* Thanh tìm kiếm */}
        <div className="w-full sm:w-72 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo họ tên hoặc SĐT..."
            className="w-full pl-10 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-700 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Table Data */}
      {members.length === 0 ? (
        <div className="p-16 text-center max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Lớp học chưa có thành viên nào
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Hãy gửi mã tham gia{" "}
            <b className="font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
              {joinCode}
            </b>{" "}
            cho học sinh của bạn để các em nhập vào hệ thống và gia nhập lớp.
          </p>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="p-12 text-center text-slate-500 text-sm">
          Không tìm thấy học sinh nào khớp với từ khóa: <b>"{searchTerm}"</b>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <th className="py-4 px-6 w-16 text-center">STT</th>
                <th className="py-4 px-6 min-w-[200px]">Họ và tên</th>
                <th className="py-4 px-6 min-w-[140px]">Số điện thoại</th>
                <th className="py-4 px-6 min-w-[140px]">Ngày tham gia</th>
                <th className="py-4 px-6 min-w-[130px] text-center">
                  Điểm gần nhất
                </th>
                <th className="py-4 px-6 text-right min-w-[120px]">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-300">
              {filteredMembers.map((member, index) => (
                <tr
                  key={member.id || member.studentId || index}
                  className="hover:bg-indigo-50/20 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-4 px-6 text-center text-slate-400 font-bold">
                    {index + 1}
                  </td>

                  {/* Họ và tên */}
                  <td className="py-4 px-6 font-extrabold text-slate-800 dark:text-slate-100">
                    {member.fullName}
                  </td>

                  {/* SĐT */}
                  <td className="py-4 px-6 font-mono text-slate-600 dark:text-slate-400 font-bold">
                    {member.phoneNumber || "09xxxxxxx"}
                  </td>

                  {/* Ngày tham gia */}
                  <td className="py-4 px-6 text-slate-500 font-medium">
                    {member.joinedAt
                      ? new Date(member.joinedAt).toLocaleDateString("vi-VN")
                      : "Vừa tham gia"}
                  </td>

                  {/* Điểm gần nhất */}
                  <td className="py-4 px-6 text-center">
                    {member.latestScore !== undefined &&
                    member.latestScore !== null ? (
                      <span className="font-extrabold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 dark:text-indigo-400 px-2.5 py-1 rounded-lg border border-indigo-100 dark:border-indigo-900">
                        {member.latestScore}
                      </span>
                    ) : (
                      <span className="text-slate-400 font-bold">-</span>
                    )}
                  </td>

                  {/* Thao tác */}
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => onOpenRemoveModal(member)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/60 transition-all border border-transparent hover:border-red-200 cursor-pointer"
                      title="Xóa học sinh này khỏi lớp"
                    >
                      <UserMinus className="w-4 h-4" />
                      <span>Mời khỏi lớp</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer Table thống kê nhanh */}
      {members.length > 0 && (
        <div className="bg-slate-50 dark:bg-slate-800/50 px-8 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
          <span>
            Hiển thị <b>{filteredMembers.length}</b> trên tổng số{" "}
            <b>{members.length}</b> học sinh
          </span>
          <span className="flex items-center gap-1 text-emerald-600 font-bold">
            <ShieldCheck className="w-4 h-4" /> Danh sách được đồng bộ tự động
          </span>
        </div>
      )}
    </div>
  );
}
