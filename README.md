# 🎓 TechEdu - Hệ Thống Giáo Dục & Đánh Giá Trực Tuyến

<p align="center">
  <img src="https://img.shields.io/badge/Spring%20Boot-3.5.0-brightgreen.svg" alt="Spring Boot" />
  <img src="https://img.shields.io/badge/Java-21-orange.svg" alt="Java 21" />
  <img src="https://img.shields.io/badge/React-19.0-blue.svg" alt="React" />
  <img src="https://img.shields.io/badge/Vite-8.1-purple.svg" alt="Vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-Vanilla-38bdf8.svg" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/MySQL-8.0-blue.svg" alt="MySQL" />
  <img src="https://img.shields.io/badge/Security-BCrypt%20%7C%20RBAC-red.svg" alt="Security" />
</p>

> **TechEdu** là nền tảng quản lý giáo dục, khảo thí và lưu trữ học liệu số toàn diện dành cho Trung tâm luyện thi và Trường học, được xây dựng theo kiến trúc phân quyền 4 vai trò với khả năng giám sát chống gian lận thi cử và bảo mật tài khoản cao cấp.

---

## 🌟 Tính Năng Nổi Bật Theo Vai Trò

### 👑 1. Phân Hệ Quản Lý Trung Tâm (Center Manager)
- **Tổng quan thời gian thực (Dashboard)**: Thống kê tức thời về số lượng nhân sự, lớp học, học liệu và đề thi toàn trung tâm.
- **Quản lý Tổ Chuyên Môn**: Thiết lập và quản lý 3 tổ bộ môn chính (*Tổ Toán học, Tổ Vật lý, Tổ Hóa học*), bổ nhiệm/thay đổi Tổ trưởng bộ môn.
- **Quản lý Danh mục Môn học & Khối lớp**: Quản lý động danh mục môn học theo từng khối (Khối 10, 11, 12) đồng bộ trực tiếp từ CSDL.
- **Kho Tài Liệu Dùng Chung**: Quản lý cây thư mục, phê duyệt và chia sẻ tài liệu ôn thi/giáo án cho toàn trung tâm.
- **Quản lý & Cấp phát Nhân sự**: Cấp phát tài khoản giáo viên/nhân viên, phân bổ vào tổ chuyên môn và hỗ trợ đặt lại mật khẩu an toàn.

### 👨‍🏫 2. Phân Hệ Giáo Viên & Tổ Trưởng (Teacher & Department Head)
- **Quản lý Lớp học**: Tạo lớp học, quản lý danh sách học sinh, chia sẻ mã tham gia lớp học (`Class Code`).
- **Khảo Thí & Soạn Đề Thi Trắc Nghiệm Chuẩn Mới**:
  - Hỗ trợ đầy đủ 3 dạng câu hỏi chuẩn Bộ GD&ĐT:
    - *Phần 1*: Trắc nghiệm 4 lựa chọn (Chọn 1 đáp án đúng).
    - *Phần 2*: Trắc nghiệm Đúng / Sai (Đánh giá 4 ý con độc lập).
    - *Phần 3*: Trắc nghiệm Trả lời ngắn (Điền số/kết quả tính toán).
- **Kho Học Liệu Cá Nhân & Bộ Môn**: Tải lên, phân loại và xem trước trực tiếp tài liệu định dạng `PDF`, `DOCX`.
- **Sổ Điểm & Báo Cáo**: Thống kê kết quả làm bài của học sinh, xuất báo cáo điểm số theo từng đề thi và lớp học.

### 🎓 3. Phân Hệ Học Sinh (Student)
- **Tham gia Lớp học**: Đăng ký vào lớp học thông qua mã lớp do giáo viên cung cấp.
- **Thi Trực Tuyến & Giám Sát Thời Gian Thực**:
  - Giao diện làm bài thi chuyên nghiệp, chia đôi màn hình thông minh (Split Screen).
  - Tự động lưu bài làm và đếm ngược thời gian nộp bài.
  - **Chống gian lận thi cử (Anti-Cheating)**: Tự động bắt sự kiện chuyển tab (`visibilitychange`), rời cửa sổ (`blur`), cảnh báo vi phạm và tự động nộp bài khi hết giờ.
- **Lịch Sử Khảo Thí**: Tra cứu điểm số, xem chi tiết bài làm và đáp án sau khi hoàn thành bài thi.

---

## 🛡️ Kiến Trúc Bảo Mật (Security Architecture)

Hệ thống được thiết kế theo các tiêu chuẩn an ninh thông tin chặt chẽ:
1. **Mã hóa Mật khẩu Chuẩn An Ninh**: 100% mật khẩu được băm một chiều bằng thuật toán **BCrypt (10 rounds)**, không bao giờ lưu mật khẩu thô trong CSDL.
2. **Phân Quyền Đa Tầng (RBAC - Role-Based Access Control)**:
   - **Backend**: Bảo vệ toàn bộ REST API bằng `@PreAuthorize("hasRole(...)")` và `SecurityFilterChain` nghiêm ngặt theo 4 vai trò.
   - **Frontend**: Điều hướng bảo vệ qua `ProtectedRoute.jsx`, ngăn chặn hoàn toàn việc can thiệp hoặc nhảy URL trái phép.
3. **Khóa Chống Dò Mật Khẩu (Brute-Force Protection)**:
   - Đếm số lần đăng nhập sai liên tiếp.
   - Nếu nhập sai **5 lần liên tiếp**, tài khoản tự động bị **khóa tạm thời 15 phút** để ngăn chặn tấn công tự động.
4. **Bắt Buộc Đổi Mật Khẩu Lần Đầu (`isFirstLogin`) & Đổi Mật Khẩu Chủ Động**:
   - Nhân sự mới được cấp phát bắt buộc phải đổi mật khẩu riêng khi đăng nhập lần đầu.
   - Tích hợp Modal **"Đổi mật khẩu"** với thanh đo độ mạnh mật khẩu ngay trên giao diện cá nhân.
5. **Chống Tấn Công Chiếm Phiên (Session Fixation Defense)**: Tự động tạo Session ID mới khi đăng nhập thành công.
6. **Chống Tấn Công SQL Injection & XSS**: 100% truy vấn dữ liệu được thực hiện qua Hibernate/JPA Parameterized Queries.

---

## 💻 Công Nghệ Sử Dụng (Tech Stack)

| Thành phần | Công nghệ / Thư viện |
|------------|-----------------------|
| **Backend Framework** | Java 21, Spring Boot 3.5.0, Spring Security, Spring Data JPA, Hibernate |
| **Frontend Framework** | React 19, Vite 8, React Router v7 |
| **Styling & UI** | Vanilla Tailwind CSS, Lucide React Icons, Glassmorphism UI |
| **Cơ sở dữ liệu** | MySQL 8.0 Dialect |
| **Giao tiếp API** | RESTful API, Axios Client (`withCredentials: true`), JSON |

---

## 📁 Cấu Trúc Thư Mục Dự Án

```
TechEdu/
├── be/
│   └── backend/                     # Mã nguồn Backend Spring Boot
│       ├── src/main/java/com/edu/assessment/
│       │   ├── config/              # SecurityConfig, DataSeeder, DatabaseSeeder
│       │   ├── controller/          # REST Controllers
│       │   ├── dto/                 # Request & Response DTOs
│       │   ├── entity/              # JPA Entities (User, Department, Subject, Class, Exam, Document, ...)
│       │   ├── repository/          # Spring Data JPA Repositories
│       │   └── service/             # Business Logic Services
│       ├── src/main/resources/
│       │   └── application.properties # Cấu hình Database & Server
│       └── pom.xml
│
├── fe/
│   └── frontend/                    # Mã nguồn Frontend React + Vite
│       ├── src/
│       │   ├── components/          # Components dùng chung & Layouts
│       │   ├── context/             # AuthContext, ToastContext, ThemeContext
│       │   ├── pages/               # Trang quản trị, giáo viên, học sinh, auth
│       │   ├── routes/              # AppRouter, ProtectedRoute
│       │   └── services/            # Axios API Services
│       ├── package.json
│       └── vite.config.js
│
└── README.md
```

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy

### 1. Yêu Cầu Môi Trường
- **Java Development Kit (JDK)**: Phiên bản 21 trở lên.
- **Node.js**: Phiên bản 18.x hoặc 20.x trở lên (kèm `npm`).
- **MySQL Server**: Phiên bản 8.0+.

---

### 2. Cài Đặt Cơ Sở Dữ Liệu
Tạo cơ sở dữ liệu MySQL rỗng:
```sql
CREATE DATABASE assessment_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Kiểm tra cấu hình trong `be/backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/assessment_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=123456
spring.jpa.hibernate.ddl-auto=update
```

---

### 3. Khởi Chạy Backend (Spring Boot)
Di chuyển vào thư mục backend và chạy lệnh:
```bash
cd be/backend
./mvnw spring-boot:run
```
*(Trên Windows PowerShell: `.\mvnw.cmd spring-boot:run`)*

Máy chủ Backend sẽ hoạt động tại: `http://localhost:8080`

---

### 4. Khởi Chạy Frontend (React + Vite)
Mở một cửa sổ Terminal mới:
```bash
cd fe/frontend
npm install
npm run dev
```

Ứng dụng Frontend sẽ hoạt động tại: `http://localhost:5173`

---

## 🔑 Dữ Liệu Khởi Tạo Mặc Định (Default Setup)

Khi khởi động lần đầu, hệ thống sẽ **tự động thiết lập cấu hình chuẩn** để bạn sử dụng ngay:

### 1. Tài khoản Quản trị cao nhất (Quản Lý Trung Tâm)
- **Số điện thoại**: `0999999999`
- **Mật khẩu khởi tạo**: `123456`
- **Vai trò**: `CENTER_MANAGER`

### 2. Tổ Chuyên Môn Mặc Định
1. *Tổ Toán học*
2. *Tổ Vật lý*
3. *Tổ Hóa học*

### 3. Danh Mục Môn Học Chuẩn (9 Môn học theo khối)
- **Khối 10**: Toán học, Vật lý, Hóa học
- **Khối 11**: Toán học, Vật lý, Hóa học
- **Khối 12**: Toán học, Vật lý, Hóa học

---

## 📄 Bản Quyền & Giấy Phép
Dự án được phát triển phục vụ mục đích học tập, nghiên cứu và Đồ án ngành Công nghệ thông tin.

© 2025 **TechEdu Team**. Mọi quyền được bảo lưu.
