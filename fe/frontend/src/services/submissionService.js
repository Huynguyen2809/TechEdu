import axiosClient from "./axiosClient";

const submissionService = {
  // 1. Hoc sinh xem danh sach bai thi da nop
  getMyHistory: async () => {
    return await axiosClient.get("/submissions/my-history");
  },

  // 2. Hoc sinh xem chi tiet bai lam (dap an doi chieu)
  getMySubmissionDetail: async (submissionId) => {
    return await axiosClient.get(`/submissions/${submissionId}/detail`);
  },
};

export default submissionService;
