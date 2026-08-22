import axiosClient from "./axiosClient";

const repositoryService = {
  // 1. Lấy danh sách thư mục và file (Hỗ trợ truyền folderId để vào thư mục con)
  getContent: async (folderId = null) => {
    const params = folderId ? { folderId } : {};
    return await axiosClient.get("/repository/content", { params });
  },

  // 2. Tạo thư mục mới
  createFolder: async (name, parentId = null) => {
    return await axiosClient.post("/repository/folders", { name, parentId });
  },

  // 3. Tải file PDF lên hệ thống (Sử dụng FormData để gửi file)
  uploadDocument: async (file, fileType, folderId = null) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileType", fileType); // 'EXAM' hoặc 'EXPLANATION'
    if (folderId) {
      formData.append("folderId", folderId);
    }

    // Lưu ý: Cần set Content-Type là multipart/form-data
    return await axiosClient.post("/repository/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // 4. Di chuyển file PDF sang thư mục khác (hoặc về Root null)
  moveDocument: async (documentId, targetFolderId = null) => {
    return await axiosClient.put(`/repository/documents/${documentId}/move`, {
      targetFolderId,
    });
  },

  // 5. Lấy danh sách tất cả thư mục của giáo viên
  getAllFolders: async () => {
    return await axiosClient.get("/repository/folders/all");
  },

  // 6. Đổi tên File PDF
  renameDocument: async (documentId, title) => {
    return await axiosClient.put(`/repository/documents/${documentId}/rename`, {
      title,
    });
  },

  // 7. Xóa File PDF
  deleteDocument: async (documentId) => {
    return await axiosClient.delete(`/repository/documents/${documentId}`);
  },

  // 8. Đổi tên Thư Mục
  renameFolder: async (folderId, name) => {
    return await axiosClient.put(`/repository/folders/${folderId}/rename`, {
      name,
    });
  },

  // 9. Xóa Thư Mục
  deleteFolder: async (folderId) => {
    return await axiosClient.delete(`/repository/folders/${folderId}`);
  },

  // 10. Đổi loại File (Đề thi <-> Lời giải)
  toggleFileType: async (documentId) => {
    return await axiosClient.put(`/repository/documents/${documentId}/toggle-type`);
  },

  // 11. Lấy danh sách Tài liệu dùng chung theo Tổ bộ môn của Giáo viên
  getSharedDepartmentDocuments: async () => {
    return await axiosClient.get("/repository/shared-documents");
  },
};

export default repositoryService;
