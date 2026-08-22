import axiosClient from "./axiosClient";

const classService = {
  // 1. Lấy danh sách lớp của tôi
  getMyClasses: async () => {
    return await axiosClient.get("/classes/my-classes");
  },

  // 2. Tạo lớp học mới (Giáo viên)
  createClass: async (classData) => {
    return await axiosClient.post("/classes", classData);
  },

  // 2.1 Lấy danh sách giáo viên cùng bộ môn
  getDepartmentTeachers: async () => {
    return await axiosClient.get("/classes/department-teachers");
  },

  // 3. Gia nhập lớp học bằng mã (Học sinh) - ĐÃ ĐỔI TÊN ĐỂ KHỚP VỚI UI
  joinClassByCode: async (joinCode) => {
    return await axiosClient.post("/classes/join", { joinCode });
  },

  // 4. Lấy thông tin chi tiết của 1 lớp học theo ID
  getClassDetails: async (classId) => {
    return await axiosClient.get(`/classes/${classId}`);
  },

  // 5. Lấy danh sách học sinh trong lớp
  getClassMembers: async (classId) => {
    return await axiosClient.get(`/classes/${classId}/members`);
  },

  // 5.1 Lấy danh sách chờ duyệt
  getPendingMembers: async (classId) => {
    return await axiosClient.get(`/classes/${classId}/pending-members`);
  },

  // 5.2 Duyệt học sinh
  approveMember: async (classId, studentId) => {
    return await axiosClient.put(`/classes/${classId}/members/${studentId}/approve`);
  },

  // 5.3 Từ chối học sinh
  rejectMember: async (classId, studentId) => {
    return await axiosClient.put(`/classes/${classId}/members/${studentId}/reject`);
  },

  // 6. Xóa (mời) một học sinh ra khỏi lớp
  removeMember: async (classId, studentId) => {
    return await axiosClient.delete(`/classes/${classId}/members/${studentId}`);
  },

  // 7. Xóa (ẩn) lớp học
  deleteClass: async (classId) => {
    return await axiosClient.delete(`/classes/${classId}`);
  },

  // 8. Lấy danh sách bài thi của lớp
  getExamsForClass: async (classId) => {
    return await axiosClient.get(`/exams/class/${classId}`);
  },

  // 9. Cập nhật thông tin lớp học - ĐÃ SỬA LỖI axiosInstance
  updateClass: async (classId, classData) => {
    // Không cần bọc try-catch hay return response.data vì Interceptor đã xử lý
    return await axiosClient.put(`/classes/${classId}`, classData);
  },
};

export default classService;
