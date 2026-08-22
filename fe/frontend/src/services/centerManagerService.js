import axiosClient from "./axiosClient";

const centerManagerService = {
    // 1. Lấy thông kê
    getSystemStats: async () => {
        return await axiosClient.get("/center-manager/stats");
    },

    getAnalyticsDashboard: async () => {
        return await axiosClient.get("/center-manager/analytics");
    },

    // Quản lý Nhân sự (Giám đốc trung tâm)
    getAllStaff: async () => {
        return await axiosClient.get("/center-manager/users");
    },

    createStaff: async (data) => {
        return await axiosClient.post("/center-manager/users", data);
    },

    updateStaff: async (id, data) => {
        return await axiosClient.put(`/center-manager/users/${id}`, data);
    },

    toggleStaffStatus: async (id) => {
        return await axiosClient.patch(`/center-manager/users/${id}/toggle-status`);
    },

    resetStaffPassword: async (id) => {
        return await axiosClient.patch(`/center-manager/users/${id}/reset-password`);
    },

    // Quản lý Tổ chuyên môn (Giám đốc trung tâm)
    getAllDepartments: async () => {
        return await axiosClient.get("/center-manager/departments");
    },

    createDepartment: async (data) => {
        return await axiosClient.post("/center-manager/departments", data);
    },

    updateDepartment: async (id, data) => {
        return await axiosClient.put(`/center-manager/departments/${id}`, data);
    },

    deleteDepartment: async (id) => {
        return await axiosClient.delete(`/center-manager/departments/${id}`);
    },

    // Quản lý Tài liệu chung (Giám đốc trung tâm)
    getAllDocuments: async () => {
        return await axiosClient.get("/center-manager/documents");
    },

    uploadDocument: async (formData) => {
        return await axiosClient.post("/center-manager/documents/upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },

    deleteDocument: async (id) => {
        return await axiosClient.delete(`/center-manager/documents/${id}`);
    }
};

export default centerManagerService;
