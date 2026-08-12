import axiosClient from "./axiosClient";

const gradebookService = {
  // 1. Xem bảng điểm tổng quan của 1 kỳ thi
  getExamGradebook: async (examId) => {
    return await axiosClient.get(`/gradebook/exam/${examId}`);
  },

  // 2. Xem chi tiết bài làm của 1 học sinh
  getSubmissionDetail: async (submissionId) => {
    return await axiosClient.get(
      `/gradebook/submission/${submissionId}/detail`,
    );
  },

  // 3. Tải file Excel Bảng điểm
  exportGradebookToExcel: async (examId) => {
    // Bắt buộc phải cấu hình responseType là blob để xử lý file nhị phân (Excel)
    return await axiosClient.get(`/gradebook/exam/${examId}/export-excel`, {
      responseType: "blob",
    });
  },
};

export default gradebookService;
