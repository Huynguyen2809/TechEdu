import axiosClient from "./axiosClient";

const authService = {
  register: async (data) => {
    return await axiosClient.post("/auth/register", data);
  },

  login: async (credentials) => {
    return await axiosClient.post("/auth/login", credentials);
  },

  logout: async () => {
    return await axiosClient.post("/auth/logout");
  },

  getCurrentUser: async () => {
    return await axiosClient.get("/auth/me");
  },

  changePasswordFirstLogin: async (newPassword) => {
    return await axiosClient.post("/auth/change-password-first-login", { newPassword });
  }
};

export default authService;
