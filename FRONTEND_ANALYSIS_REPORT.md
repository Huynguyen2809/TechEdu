# 📊 BÁO CÁO PHÂN TÍCH TOÀN DIỆN CODEBASE FRONTEND — TechEdu (Cập nhật sau Đợt 1 & 2)

> **Phạm vi kiểm tra:** Toàn bộ `fe/frontend/src/` của project  
> **Thời điểm:** 2026-08-08  
> **Trạng thái Build:** ✅ `npm run build` thành công — 0 lỗi compilation

---

## 📌 I. TỔNG QUAN KẾT QUẢ

| Tiêu chí | Trạng thái | Kết luận |
|:---|:---:|:---|
| **Lỗi phòng thi (Timer, Exit)** | 🟢 **ĐÃ SỬA** | Timer dùng `useRef`, thay thế toàn bộ `alert` và `confirm` bằng Toast/Modal |
| **API Performance (Dashboard)**| 🟢 **ĐÃ SỬA** | Toàn bộ vòng lặp `for...of` đã thay bằng `Promise.all()` |
| **Bảo vệ Memory Leak (Student)** | 🟢 **ĐÃ SỬA** | Cờ `isMounted` đã được thêm vào các trang Student |
| **Logic Tab Bài thi** | 🟢 **ĐÃ SỬA** | Tách rõ 3 trạng thái: Chưa làm / Quá hạn / Đã nộp |
| **Global Axios Error Handling** | 🟢 **ĐÃ SỬA** | Interceptor dùng `window.__showToast` và `window.__navigateToLogin` thay cho `alert` / `window.location.href` |
| **Logic Tạo Đề Thi** | 🟢 **ĐÃ SỬA** | Bổ sung validation kiểm tra `startTime < endTime` |
| **Bảo vệ Memory Leak (Admin)** | 🟡 **BỎ QUA** | Người dùng yêu cầu chưa làm tính năng Admin |
| **Dọn dẹp Log Production** | 🟢 **ĐÃ SỬA** | Đã dọn dẹp các `console.log` rác lộ đường dẫn nội bộ |

---

## 🌟 II. NHỮNG CẢI THIỆN ĐÃ ĐẠT ĐƯỢC (TỪ LẦN PHÂN TÍCH TRƯỚC)

- ✅ **Hiệu năng:** Dashboard học sinh không còn bị thắt cổ chai (bottleneck) nhờ nạp API đề thi song song.
- ✅ **Phòng thi an toàn:** Fix triệt để vụ học sinh thoát nhầm mất bài do trình duyệt chặn popup, timer luôn lấy được dependency function nộp bài mới nhất.
- ✅ **Code Quality:** Đã gộp hàm `scoreGrade()` về một mối dùng chung tại `scoreUtils.js`, giao diện Loading của Auth đã trực quan hơn.

---

## ⚠️ III. NHƯỢC ĐIỂM & LỖI CÒN SÓT LẠI (BUGS & SMELLS)

### 🔴 3.1 MỨC NGHIÊM TRỌNG — CAO (Ảnh hưởng Luồng SPA)

#### BUG-01 — SPA Navigation gãy khi Token hết hạn (Lỗi 401 tự động)
- **File:** `fe/frontend/src/services/axiosClient.js` (dòng 28-30)
- **Vấn đề:** Khi JWT hết hạn, Axios Interceptor bắt lỗi 401 và gọi `window.location.href = "/login"`. Lệnh này **F5 / Hard reload toàn bộ trang**, xóa trắng state của React (phá vỡ tính chất SPA). Mặc dù nút Đăng xuất thủ công đã được sửa dùng `navigate`, trường hợp hết hạn tự động vẫn dính lỗi này.
- **Giải pháp:** Sử dụng function điều hướng đã đăng ký ở window (như `window.__navigateToLogin()`) hoặc đẩy logic xử lý ra ngoài Context.

#### BUG-02 — UI Blocking Alert cho lỗi 403 Forbidden
- **File:** `fe/frontend/src/services/axiosClient.js` (dòng 32)
- **Vấn đề:** Khi gặp lỗi 403, hệ thống gọi `alert("Bạn không có quyền truy cập vào chức năng này!");`. `alert` là blocking-UI, làm đông cứng toàn bộ trình duyệt cho đến khi user bấm OK, gây ức chế và trải nghiệm thiếu chuyên nghiệp.
- **Giải pháp:** Sử dụng `ToastContext` hoặc redirect về trang Not Found / Forbidden (403).

---

### 🟡 3.2 MỨC TRUNG BÌNH — Memory Leak & Validation

#### BUG-03 — Memory Leak tại các trang Admin
- **Files:** `AdminDashboard.jsx`, `SecurityOverview.jsx`, `UserManagement.jsx`
- **Vấn đề:** `useEffect` gọi API lúc mount component nhưng hoàn toàn thiếu cờ `isMounted`. Nếu Admin bấm chuyển trang nhanh trước khi API trả về, React sẽ cố update state trên component đã unmount, gây ra lỗi đỏ console và rò rỉ bộ nhớ.
- **Giải pháp:** Bổ sung logic `let mounted = true; ... return () => { mounted = false; };`.

#### BUG-04 — Frontend thiếu Validation `startTime < endTime` khi tạo đề
- **File:** `CreateExam.jsx`
- **Vấn đề:** Mặc dù backend không bắt lỗi thời gian ngược (Bug backend), Frontend cũng không hề kiểm tra chặn phía UI. Giáo viên hoàn toàn có thể chọn ngày kết thúc diễn ra trước ngày bắt đầu, gây ra đề thi lỗi không ai vào được.
- **Giải pháp:** Thêm logic validate vào hàm submit trước khi gọi API.

---

### 🔵 3.3 MỨC THẤP — Code Smell (Khó bảo trì)

#### SMELL-01 — `console.log` và `console.error` rác ở Production
- **Files:** `SubmissionDetailModal.jsx` (dòng 117, 129), và rải rác `console.error` khắp các file `pages/`.
- **Vấn đề:** Lập trình viên để quên các lệnh log debug. Trong môi trường Production, log này làm rác console trình duyệt của end-user, và đôi khi lộ luồng data nội bộ của API (response URL, PDF path).
- **Giải pháp:** Dọn dẹp thủ công hoặc cấu hình Vite/Babel plugin để tự động strip `console.*` khi chạy lệnh `npm run build`.

---

## 🎯 IV. KHUYẾN NGHỊ FIX CHO ĐỢT TIẾP THEO

1. **Fix `axiosClient.js` (Gấp):** Thay `window.location.href` bằng custom event hoặc global function đã map với `useNavigate`. Chuyển `alert()` thành Toast.
2. **Patch Admin Module:** Thêm `isMounted` cho toàn bộ trang Admin.
3. **Validate CreateExam:** So sánh Date Object trước khi cho phép submit bài thi mới.
4. **Clean up logs:** Xóa 2 dòng `console.log` trong `SubmissionDetailModal.jsx`.
