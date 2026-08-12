import axiosClient from "./axiosClient";

const examService = {
  createExam: async (examData) => {
    return await axiosClient.post("/exams", examData);
  },

  // [MỚI] Lấy dữ liệu phòng thi (PDF + Khung đáp án)
  getExamForTaking: async (examId) => {
    return await axiosClient.get(`/exams/${examId}/take`);
  },

  // [MỚI] Nộp bài và nhận điểm
  submitExam: async (examId, submitData) => {
    return await axiosClient.post(`/exams/${examId}/submit`, submitData);
  },
};

export default examService;
