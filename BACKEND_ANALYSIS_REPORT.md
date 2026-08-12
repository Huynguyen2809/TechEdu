# Báo cáo phân tích Nhược điểm Code Backend (Spring Boot)

Dựa trên việc đọc và phân tích mã nguồn backend hiện tại, dưới đây là tổng quan các nhược điểm, lỗi thiết kế và trạng thái khắc phục tính đến thời điểm hiện tại:

---

## 📌 I. TỔNG QUAN KẾT QUẢ REFACTORING

| Tiêu chí | Trạng thái | Kết luận |
|:---|:---:|:---|
| **Vấn đề 1: Bảo mật & Xác thực (Session)** | 🟡 **BỎ QUA** | Hệ thống vẫn đang dùng `HttpSession`. Giữ nguyên theo yêu cầu. |
| **Vấn đề 2: Code Smell (Dùng Map, lặp code)** | 🟡 **BỎ QUA** | Vẫn dùng `Map<String, Object>` để trả response. Giữ nguyên theo yêu cầu. |
| **Vấn đề 3: Quản lý Lỗi (Error Handling)** | 🟢 **ĐÃ SỬA** | Xóa toàn bộ `try-catch` lặp lại ở 7 Controllers. Chuyển sang dùng `GlobalExceptionHandler`. |
| **Vấn đề 4: Hiệu năng (N+1 Query)** | 🟢 **ĐÃ SỬA** | Đã bổ sung `JOIN FETCH` và truy vấn gộp (Toán tử `IN`) để triệt tiêu các vòng lặp tạo ra N+1 query. |

---

## 🌟 II. CHI TIẾT CÁC VẤN ĐỀ CÒN TỒN ĐỌNG (ĐÃ QUYẾT ĐỊNH GIỮ NGUYÊN)

### 1. Vấn đề về Bảo mật & Xác thực (Security & Authentication)
- **Sử dụng Session thay vì JWT cho REST API**: Việc dùng Session (Cookie) không phải chuẩn mực của REST API hiện đại (Stateless), dễ gây khó khăn khi mở rộng (Scaling) hệ thống ra nhiều server (phải dùng Sticky Session hoặc Redis) và có thể gặp vấn đề về CORS khi frontend nằm ở domain khác.
- **Service xử lý đối tượng HTTP**: `AuthService` đang nhận trực tiếp `HttpServletRequest` để quản lý Session. Theo chuẩn thiết kế, tầng Service (Nghiệp vụ) nên độc lập với các thư viện HTTP Servlet.

### 2. Vấn đề về Thiết kế Kiến trúc & Code Smell
- **Sử dụng `Map<String, Object>` tràn lan**: Các Service đang trả về `Map<String, Object>` thay vì các đối tượng **Response DTO**. Việc này làm code dễ phát sinh lỗi đánh máy khóa key, khó bảo trì và không thể tự động tạo tài liệu API bằng Swagger.

---

## ⚠️ III. CÁC LỖI TIỀM ẨN TRỌNG YẾU TƯƠNG LAI (TECHNICAL DEBT)

Qua quá trình rà soát mã nguồn, hệ thống có những nguy cơ tiềm ẩn dễ dẫn đến lỗi nghiêm trọng (crash, mất dữ liệu) khi triển khai thực tế (Production):

### 1. Rủi ro mất toàn bộ file PDF khi Deploy (RepositoryService)
- **Lỗi:** Hiện tại hàm `uploadDocument` đang lưu file trực tiếp vào ổ cứng server tại thư mục `local-storage/uploads/`.
- **Hậu quả:** Khi bạn triển khai (Deploy) backend lên các dịch vụ đám mây (Cloud như Heroku, Render, AWS Elastic Beanstalk), hệ thống file (filesystem) thường là **ephemeral (tạm thời)**. Tức là mỗi lần server khởi động lại (restart) hoặc deploy code mới, toàn bộ ổ cứng sẽ bị reset và **xóa sạch mọi file PDF đề thi của giáo viên**.
- **Giải pháp:** Cần tích hợp dịch vụ lưu trữ đám mây (Cloud Storage) như **AWS S3, Google Cloud Storage, hoặc Cloudinary** để lưu trữ file tĩnh vĩnh viễn.

### 2. Lỗi Concurrency (Double-submit) khi nộp bài thi
- **Lỗi:** Trong `ExamService.submitExam()`, hệ thống dùng hàm `existsByExamIdAndStudentId` để kiểm tra học sinh đã nộp bài chưa, nếu chưa thì sẽ lưu `ExamSubmission`.
- **Hậu quả:** Nếu học sinh mạng lag và bấm nút "Nộp bài" 2 lần liên tục thật nhanh, hoặc dùng tool auto-click, hai luồng request sẽ chạy song song, cùng vượt qua vòng check `if` và lưu 2 bài nộp cho cùng 1 đề thi (Phá vỡ quy tắc mỗi người nộp 1 lần).
- **Giải pháp:** Cần đánh index `UNIQUE CONSTRAINT (exam_id, student_id)` trong cơ sở dữ liệu MySQL, và/hoặc thêm Optimistic/Pessimistic Locking.

### 3. Lỗi Crash khi Xóa thư mục chứa thư mục con (Recursive Delete)
- **Lỗi:** Hàm `deleteFolder` trong `RepositoryService` hiện tại chỉ lấy danh sách file nằm trực tiếp trong thư mục đó để xóa, nhưng **không kiểm tra hoặc xóa các thư mục con (sub-folders)** nằm bên trong nó.
- **Hậu quả:** Nếu giáo viên xóa một thư mục cha mà bên trong chứa thư mục con, Database sẽ văng lỗi `DataIntegrityViolationException` (lỗi khóa ngoại foreign key constraint) vì thư mục con đang tham chiếu (parent_id) tới thư mục bị xóa, làm hệ thống Crash hoặc trả về 500.
- **Giải pháp:** Phải viết logic xóa đệ quy (Recursive) từ thư mục dưới cùng lên, hoặc sử dụng `CascadeType.REMOVE` kết hợp xóa file mềm.

### 4. Thiếu cơ chế Phân trang (Pagination)
- **Lỗi:** Các API danh sách như `getExamsForClass`, `getUsers`, `getClassMembers` hiện đang trả về toàn bộ danh sách bằng `List<Map>`.
- **Hậu quả:** Nếu hệ thống chạy thực tế với một lớp học có 2000 học sinh, hoặc bảng lịch sử có 100,000 dòng, server sẽ tải toàn bộ vào RAM cùng một lúc. Điều này sẽ lập tức làm sập Server do tràn bộ nhớ (Out of Memory - OOM Error) và làm Backend bị chết cứng.
- **Giải pháp:** Cần thêm thông số `?page=0&size=20` (Sử dụng đối tượng `Pageable` của Spring Data JPA) cho mọi API lấy danh sách.
