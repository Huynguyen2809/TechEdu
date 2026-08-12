/**
 * Chuyển đổi đường dẫn tương đối từ backend thành URL đầy đủ
 * Dựa theo cấu hình VITE_SERVER_URL hoặc fallback về http://localhost:8080
 */
export const getApiFileUrl = (filePath) => {
  if (!filePath) return "";
  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    return filePath;
  }
  const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:8080";
  const cleanPath = filePath.startsWith("/") ? filePath : `/${filePath}`;
  return `${serverUrl}${cleanPath}`;
};
