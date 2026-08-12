import axios from "axios";

// Khởi tạo Axios trỏ về Spring Boot Server (Sử dụng biến môi trường Vite)
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  // BẮT BUỘC: Cho phép trình duyệt đính kèm Cookie JSESSIONID gửi lên Server
  withCredentials: true,
  // Cấu hình CSRF Token
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
});

// Interceptor cho Request
axiosClient.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error),
);

// Interceptor cho Response: Xử lý dữ liệu và bắt lỗi bảo mật tập trung
axiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const { status } = error.response || {};
    if (status === 401) {
      console.warn("Phiên đăng nhập hết hạn hoặc trình duyệt đang chặn Cookie JSESSIONID.");
      if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
        if (window.__navigateToLogin) {
          window.__navigateToLogin();
        } else {
          window.location.href = "/login";
        }
      }
    } else if (status === 403) {
      if (window.__showToast) {
        window.__showToast("Bạn không có quyền truy cập vào chức năng này!", "error");
      } else {
        console.warn("Bạn không có quyền truy cập vào chức năng này!");
      }
    }
    return Promise.reject(error);
  },
);

export default axiosClient;
