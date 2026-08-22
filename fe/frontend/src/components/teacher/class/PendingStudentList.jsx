import React from "react";
import {
  Users,
  CheckCircle,
  XCircle,
  Search,
  X
} from "lucide-react";

export default function PendingStudentList({
  pendingMembers,
  onApprove,
  onReject,
  actionLoading
}) {
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredMembers = React.useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return pendingMembers;
    return pendingMembers.filter((m) => {
      const nameMatch = (m.fullName || "").toLowerCase().includes(term);
      const phoneMatch = (m.phoneNumber || "").includes(term);
      return nameMatch || phoneMatch;
    });
  }, [pendingMembers, searchTerm]);

  if (pendingMembers.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-orange-200 dark:border-orange-800 shadow-xs dark:shadow-none overflow-hidden mb-8">
      {/* Table Toolbar */}
      <div className="p-6 sm:p-8 border-b border-orange-100 dark:border-orange-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-orange-50/50 dark:bg-orange-950/20">
        <div>
          <h2 className="text-lg font-extrabold text-orange-600 dark:text-orange-500 flex items-center gap-2">
            <Users className="w-6 h-6" />
            Danh Sách Chờ Duyệt ({pendingMembers.length})
          </h2>
          <p className="text-xs text-orange-700/70 dark:text-orange-400 mt-0.5">
            Những học sinh này đã nhập mã và đang chờ bạn phê duyệt để vào lớp.
          </p>
        </div>

        {/* Thanh tìm kiếm */}
        <div className="w-full sm:w-72 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-orange-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo họ tên hoặc SĐT..."
            className="w-full pl-10 pr-8 py-2.5 bg-white dark:bg-slate-800 border border-orange-200 dark:border-orange-800/50 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-all"
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
      {filteredMembers.length === 0 ? (
        <div className="p-12 text-center text-slate-500 text-sm">
          Không tìm thấy học sinh chờ duyệt nào khớp với từ khóa: <b>"{searchTerm}"</b>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse min-w-[750px]">
            <thead>
              <tr className="bg-orange-50/30 dark:bg-slate-800/60 text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-orange-100 dark:border-slate-800">
                <th className="py-4 px-6 w-16 text-center">STT</th>
                <th className="py-4 px-6 min-w-[200px] text-left">Họ và tên</th>
                <th className="py-4 px-6 min-w-[140px] text-center">Số điện thoại</th>
                <th className="py-4 px-6 min-w-[140px] text-center">Thời gian xin vào</th>
                <th className="py-4 px-6 text-center min-w-[200px]">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-orange-50 dark:divide-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-300">
              {filteredMembers.map((member, index) => (
                <tr
                  key={member.id || member.studentId || index}
                  className="hover:bg-orange-50/40 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-4 px-6 text-center text-slate-400 font-bold">
                    {index + 1}
                  </td>

                  {/* Họ và tên */}
                  <td className="py-4 px-6 text-left font-extrabold text-slate-800 dark:text-slate-100">
                    {member.fullName}
                  </td>

                  {/* SĐT */}
                  <td className="py-4 px-6 text-center font-mono text-slate-600 dark:text-slate-400 font-bold">
                    {member.phoneNumber || "09xxxxxxx"}
                  </td>

                  {/* Ngày tham gia */}
                  <td className="py-4 px-6 text-center text-slate-500 font-medium">
                    {member.requestedAt
                      ? new Date(member.requestedAt).toLocaleString("vi-VN")
                      : "Vừa xong"}
                  </td>

                  {/* Thao tác */}
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onApprove(member)}
                        disabled={actionLoading}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 border border-transparent hover:border-emerald-200 cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Duyệt</span>
                      </button>
                      <button
                        onClick={() => onReject(member)}
                        disabled={actionLoading}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 border border-transparent hover:border-rose-200 cursor-pointer disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Từ chối</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
