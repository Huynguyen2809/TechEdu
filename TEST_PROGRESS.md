# 🧪 TEST PROGRESS — TechEdu Project

> **Dự án:** TechEdu — `https://github.com/Huynguyen2809/TechEdu`
> **Cập nhật lần cuối:** 2026-08-18
> **Môi trường test:** `http://localhost:5173` (FE) | `http://localhost:8080` (BE)
> **Stack:** React + Vite + Tailwind CSS | Spring Boot 3.4 + MySQL + Redis | Session-based Auth (JSESSIONID)

---

## 📊 TỔNG QUAN TIẾN ĐỘ

| Session | Nhóm | Số TC | Trạng thái | Ngày test |
|---|---|---|---|---|
| Session 1 | 🔐 Auth & Onboarding | 3 | 🔄 Đang chạy | 2026-08-18 |
| Session 2 | 🏫 Center Manager | 6 | ⏳ Chờ | — |
| Session 3 | 👩‍🏫 Teacher | 6 | ⏳ Chờ | — |
| Session 4 | 🎓 Student | 6 | ⏳ Chờ | — |

**Tổng:** `0/21` chức năng đã test ✅ | `0` bug phát hiện 🐛

> 💡 **Hướng dẫn tiếp tục:** Tìm TC có trạng thái `⏳ Chưa test` → mở conversation mới → dùng `/goal` → test tiếp

---

## 🔐 SESSION 1 — Auth & Onboarding

> **Trạng thái:** 🔄 Đang chạy | **Ngày test:** 2026-08-18

---

### TC-01 — Đăng nhập (Login)

| Thuộc tính | Chi tiết |
|---|---|
| **File** | `fe/frontend/src/pages/auth/Login.jsx` |
| **API** | `POST /api/v1/auth/login` |
| **URL** | `http://localhost:5173/login` |
| **Trạng thái** | ⏳ Chưa test |

**Kịch bản test:**
- [ ] Login Teacher hợp lệ → redirect `/teacher/dashboard`
- [ ] Login Student hợp lệ → redirect `/student/dashboard`
- [ ] Login Center Manager hợp lệ → redirect `/center-manager/dashboard`
- [ ] Sai mật khẩu → hiển thị lỗi thân thiện
- [ ] Email không tồn tại → hiển thị lỗi
- [ ] Bỏ trống form → validation hiển thị đúng

**Kết quả:** `Chưa có`
**Bugs:** Không có

---

### TC-02 — Đăng ký (Register)

| Thuộc tính | Chi tiết |
|---|---|
| **File** | `fe/frontend/src/pages/auth/Register.jsx` |
| **API** | `POST /api/v1/auth/register` |
| **URL** | `http://localhost:5173/register` |
| **Trạng thái** | ⏳ Chưa test |

**Kịch bản test:**
- [ ] Đăng ký tài khoản mới hợp lệ → thành công
- [ ] Email đã tồn tại → báo lỗi
- [ ] Mật khẩu không khớp → validation
- [ ] Bỏ trống bắt buộc → validation

**Kết quả:** `Chưa có`
**Bugs:** Không có

---

### TC-03 — Đổi mật khẩu lần đầu (Force Change Password)

| Thuộc tính | Chi tiết |
|---|---|
| **File** | `fe/frontend/src/pages/auth/ForceChangePassword.jsx` |
| **URL** | `http://localhost:5173/force-change-password` |
| **Trạng thái** | ⏳ Chưa test |

**Kịch bản test:**
- [ ] User mới login → tự động redirect tới trang đổi mật khẩu
- [ ] Đổi mật khẩu hợp lệ → thành công, redirect dashboard
- [ ] Mật khẩu mới không đủ mạnh → validation
- [ ] Mật khẩu mới trùng cũ → thông báo lỗi

**Kết quả:** `Chưa có`
**Bugs:** Không có

---

## 🏫 SESSION 2 — Center Manager

> **Trạng thái:** ⏳ Chờ Session 1 | **Ngày test:** —

---

### TC-04 — Dashboard Tổng quan

| Thuộc tính | Chi tiết |
|---|---|
| **File** | `fe/frontend/src/pages/center-manager/CenterManagerDashboard.jsx` |
| **URL** | `http://localhost:5173/center-manager/dashboard` |
| **Trạng thái** | ⏳ Chưa test |

**Kịch bản test:**
- [ ] Dashboard hiển thị đầy đủ thống kê (số user, lớp, bài thi...)
- [ ] Các widget/card load dữ liệu đúng
- [ ] Navigation sidebar hoạt động đúng
- [ ] Responsive layout ổn định

**Kết quả:** `Chưa có`
**Bugs:** Không có

---

### TC-05 — Quản lý người dùng (User Management)

| Thuộc tính | Chi tiết |
|---|---|
| **File** | `fe/frontend/src/pages/center-manager/UserManagement.jsx` |
| **URL** | `http://localhost:5173/center-manager/users` |
| **Trạng thái** | ⏳ Chưa test |

**Kịch bản test:**
- [ ] Hiển thị danh sách user có phân trang
- [ ] Tìm kiếm theo tên/email
- [ ] Filter theo role (TEACHER/STUDENT)
- [ ] Tạo user mới Teacher → thành công
- [ ] Tạo user mới Student → thành công
- [ ] Sửa thông tin user → lưu thành công
- [ ] Khóa/mở khóa tài khoản
- [ ] Xóa user → có xác nhận trước

**Kết quả:** `Chưa có`
**Bugs:** Không có

---

### TC-06 — Quản lý danh mục (Category Management)

| Thuộc tính | Chi tiết |
|---|---|
| **File** | `fe/frontend/src/pages/center-manager/CategoryManagement.jsx` |
| **URL** | `http://localhost:5173/center-manager/categories` |
| **Trạng thái** | ⏳ Chưa test |

**Kịch bản test:**
- [ ] Hiển thị danh sách danh mục
- [ ] Thêm danh mục mới → thành công
- [ ] Sửa danh mục → lưu thành công
- [ ] Xóa danh mục → có xác nhận

**Kết quả:** `Chưa có`
**Bugs:** Không có

---

### TC-07 — Quản lý phòng ban (Department Management)

| Thuộc tính | Chi tiết |
|---|---|
| **File** | `fe/frontend/src/pages/center-manager/DepartmentManagement.jsx` |
| **URL** | `http://localhost:5173/center-manager/departments` |
| **Trạng thái** | ⏳ Chưa test |

**Kịch bản test:**
- [ ] Hiển thị danh sách phòng ban
- [ ] Thêm phòng ban mới → thành công
- [ ] Sửa phòng ban → lưu thành công
- [ ] Xóa phòng ban → có xác nhận
- [ ] Gán giáo viên vào phòng ban

**Kết quả:** `Chưa có`
**Bugs:** Không có

---

### TC-08 — Quản lý tài liệu (Document Management)

| Thuộc tính | Chi tiết |
|---|---|
| **File** | `fe/frontend/src/pages/center-manager/DocumentManagement.jsx` |
| **URL** | `http://localhost:5173/center-manager/documents` |
| **Trạng thái** | ⏳ Chưa test |

**Kịch bản test:**
- [ ] Hiển thị danh sách tài liệu
- [ ] Upload tài liệu mới → thành công
- [ ] Xem/tải tài liệu
- [ ] Xóa tài liệu → có xác nhận
- [ ] Tìm kiếm / filter tài liệu

**Kết quả:** `Chưa có`
**Bugs:** Không có

---

### TC-09 — Security Overview

| Thuộc tính | Chi tiết |
|---|---|
| **File** | `fe/frontend/src/pages/center-manager/SecurityOverview.jsx` |
| **URL** | `http://localhost:5173/center-manager/security` |
| **Trạng thái** | ⏳ Chưa test |

**Kịch bản test:**
- [ ] Hiển thị log đăng nhập / hoạt động hệ thống
- [ ] Xem chi tiết sự kiện bảo mật
- [ ] Filter theo thời gian / loại sự kiện

**Kết quả:** `Chưa có`
**Bugs:** Không có

---

## 👩‍🏫 SESSION 3 — Teacher *(Chưa bắt đầu)*

> **Trạng thái:** ⏳ Chờ | **File:** `ClassManagement`, `ClassDetail`, `CreateExam`, `Repository`, `Gradebook`, `TeacherDashboard`

| TC | Chức năng | Trạng thái |
|---|---|---|
| TC-10 | Teacher Dashboard | ⏳ Chưa test |
| TC-11 | Quản lý lớp học | ⏳ Chưa test |
| TC-12 | Chi tiết lớp học | ⏳ Chưa test |
| TC-13 | Kho câu hỏi (Repository) | ⏳ Chưa test |
| TC-14 | Tạo đề thi | ⏳ Chưa test |
| TC-15 | Sổ điểm (Gradebook) | ⏳ Chưa test |

---

## 🎓 SESSION 4 — Student *(Chưa bắt đầu)*

> **Trạng thái:** ⏳ Chờ | **File:** `StudentDashboard`, `MyClasses`, `StudentClassDetail`, `TakeExam`, `ExamHistory`, `UpcomingExams`

| TC | Chức năng | Trạng thái |
|---|---|---|
| TC-16 | Student Dashboard | ⏳ Chưa test |
| TC-17 | Danh sách lớp | ⏳ Chưa test |
| TC-18 | Chi tiết lớp (Student view) | ⏳ Chưa test |
| TC-19 | Làm bài thi (TakeExam) | ⏳ Chưa test |
| TC-20 | Lịch sử bài thi | ⏳ Chưa test |
| TC-21 | Lịch thi sắp tới | ⏳ Chưa test |

---

## 🐛 BUGS TỔNG HỢP

| # | TC | Chức năng | Mô tả Bug | Mức độ | Trạng thái |
|---|---|---|---|---|---|
| — | — | — | *Chưa phát hiện bug nào* | — | — |

---

## 📝 HƯỚNG DẪN TIẾP TỤC

1. Mở file này → xem cột **Trạng thái**
2. Tìm TC đầu tiên còn `⏳ Chưa test`
3. Mở **conversation mới** trong Antigravity
4. Nói: *"Tiếp tục test TechEdu từ [TC-XX], xem file TEST_PROGRESS.md để biết context"*
5. Dùng lệnh `/goal` để agent chạy không dừng giữa chừng
6. Sau khi xong → agent sẽ cập nhật file này

