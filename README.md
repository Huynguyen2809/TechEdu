# TechEdu - Hệ thống Giáo dục và Đánh giá trực tuyến

Đây là dự án Đồ án ngành (Major Project).

## 📂 Cấu trúc dự án

Dự án được chia thành 2 phần chính:
- **`be/`** (Backend): Phát triển bằng Java Spring Boot.
- **`fe/`** (Frontend): Phát triển bằng ReactJS.

## 🚀 Hướng dẫn cài đặt và khởi chạy

### 1. Backend (Spring Boot)
- Di chuyển vào thư mục backend:
  ```bash
  cd be/backend
  ```
- Cấu hình các thông số database trong file `application.properties` hoặc `application.yml` (nếu cần thiết).
- Chạy dự án:
  ```bash
  mvn spring-boot:run
  ```
  *(Hoặc mở thư mục `be/backend` bằng IntelliJ IDEA/Eclipse và chạy class Main)*

### 2. Frontend (React + Vite)
- Di chuyển vào thư mục frontend:
  ```bash
  cd fe/frontend
  ```
- Cài đặt các thư viện cần thiết:
  ```bash
  npm install
  ```
- Khởi chạy ứng dụng môi trường dev:
  ```bash
  npm run dev
  ```

## 🔑 Tài khoản mặc định (DataSeeder)
Hệ thống tự động sinh 4 tài khoản mặc định (Mật khẩu: `123456`):
- **Center Manager (Giám đốc):** `0999999999`
- **Department Head (Tổ trưởng):** `0888888888`
- **Teacher (Giáo viên):** `0777777777`
- **Student (Học sinh):** `0666666666`

*(Lưu ý: Đăng nhập lần đầu sẽ yêu cầu đổi mật khẩu)*

## 📄 Tài liệu tham khảo
- `APIs.docx`: Tài liệu mô tả API.

---
*Dự án đang trong quá trình phát triển.*
