# 📋 Bug Notes — Hệ thống Kiểm tra Đánh giá Trực tuyến

**Ngày kiểm tra:** 2026-08-17  
**Phương pháp:** API Integration Testing + Concurrent Load Testing (20 Virtual Users)  
**Tổng số lỗi phát hiện:** 17 lỗi (1 Critical, 6 High, 9 Medium, 1 Low)

---

## 🔴 BUG #1 — [CRITICAL] Lỗ hổng gian lận điểm thi (Duplicate Question Attack)

| Thuộc tính | Chi tiết |
|---|---|
| **Mức độ** | 🔴 Critical |
| **Trạng thái** | ✅ Đã vá |
| **File liên quan** | `be/backend/src/main/java/com/edu/assessment/service/ExamService.java` |
| **File liên quan** | `be/backend/src/main/java/com/edu/assessment/dto/request/SubmitExamRequest.java` |

**Mô tả:**  
Hàm `submitExam` lặp qua danh sách đáp án học sinh gửi lên mà không kiểm tra `questionId` trùng lặp. Học sinh dùng F12/Postman chèn cùng một câu trả lời đúng 40 lần vào JSON payload để đạt **điểm 10.0 tuyệt đối** từ bài thi chỉ có 1 câu (0.25 điểm).

**Chứng minh (PoC):**
```
Input:  1 câu hỏi đúng, lặp 40 lần trong payload
Output: totalScore = 10.0  ← ĐÃ ĐƯỢC XÁC NHẬN
```

**Cách sửa đã áp dụng:**
- **Lớp 1 (`ExamService.java`):** Thêm `Set<Long> processedQuestionIds` trong vòng lặp chấm điểm — mỗi `questionId` chỉ được chấm đúng 1 lần.
- **Lớp 2 (`SubmitExamRequest.java`):** Thêm `@Size(max = 28)` để reject ngay payload có > 28 câu (chuẩn GD&ĐT 2025 tối đa 28 câu).

---

## 🟠 BUG #2 — [HIGH] Race Condition khi nộp bài đôi (Double Submit)

| Thuộc tính | Chi tiết |
|---|---|
| **Mức độ** | 🟠 High |
| **Trạng thái** | ✅ Đã vá (UX cải thiện) |
| **File liên quan** | `be/backend/src/main/java/com/edu/assessment/service/ExamService.java` |
| **File liên quan** | `be/backend/src/main/java/com/edu/assessment/exception/GlobalExceptionHandler.java` |

**Mô tả:**  
Khi cùng một học sinh bắn 2 request nộp bài thi **đồng thời** (cùng mili-giây), cả 2 request vào `submitExam` trước khi transaction đầu tiên commit. Lớp kiểm tra logic `existsByExamIdAndStudentId` bị vượt qua do hai transaction chạy song song (TOCTOU — Time-of-Check-Time-of-Use bug). Kết quả:
- Database Unique Key (`UKbbl161lhoispxt052w1b498bq`) cứu vãn, chỉ 1 bản ghi được lưu ✅
- Request "thua" trả về **`500 Lỗi hệ thống`** thay vì `400 Bad Request` thân thiện ❌

**Cách sửa đã áp dụng:**
- **`GlobalExceptionHandler.java`:** Thêm handler `DataIntegrityViolationException` — khi DB Unique Key bị vi phạm (nộp bài đôi), trả về **400 Bad Request** với thông báo thân thiện `"Bạn đã nộp bài cho đề thi này rồi! Không thể nộp lại."` thay vì 500.

```java
// GlobalExceptionHandler.java — đã thêm:
@ExceptionHandler(DataIntegrityViolationException.class)
public ResponseEntity<Map<String, String>> handleDataIntegrityViolation(DataIntegrityViolationException e) {
    String msg = e.getMessage() != null && e.getMessage().contains("exam_submissions")
            ? "Bạn đã nộp bài cho đề thi này rồi! Không thể nộp lại."
            : "Dữ liệu bị trùng lặp, thao tác không hợp lệ!";
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", msg));
}
```

> ⚠️ **Ghi chú:** Van an toàn cuối vẫn là DB Unique Key. Nếu cần tăng cường hơn có thể áp dụng thêm `@Transactional(isolation = Isolation.SERIALIZABLE)` hoặc pessimistic lock.

---

## 🟠 BUG #3 — [HIGH] Validation lỗi trả về HTTP 500 thay vì 400

| Thuộc tính | Chi tiết |
|---|---|
| **Mức độ** | 🟠 High |
| **Trạng thái** | ✅ Đã vá |
| **File liên quan** | `be/backend/src/main/java/com/edu/assessment/exception/GlobalExceptionHandler.java` |

**Mô tả:**  
`GlobalExceptionHandler` thiếu 2 handler quan trọng:
1. `MethodArgumentNotValidException` — khi dữ liệu gửi lên thiếu trường bắt buộc (`@NotNull`, `@NotBlank`, `@Size`...) bị rơi vào `Exception.class` và trả về **500** kèm chuỗi kỹ thuật dài lằng nhằng.
2. `AccessDeniedException` — khi user gọi API ngoài quyền hạn, trả về **500 "Lỗi hệ thống: Access Denied"** thay vì **403 Forbidden** chuẩn REST.

**Cách sửa đã áp dụng:** Thêm 2 handler riêng biệt:
- `MethodArgumentNotValidException` → **400 Bad Request** với message gộp từ tất cả field errors.
- `AccessDeniedException` → **403 Forbidden** với message `"Bạn không có quyền thực hiện thao tác này!"`.

---

## 🟡 BUG #4 — [MEDIUM] Không validate định dạng Số điện thoại khi Đăng ký

| Thuộc tính | Chi tiết |
|---|---|
| **Mức độ** | 🟡 Medium |
| **Trạng thái** | ✅ Đã vá |
| **File liên quan** | `be/backend/src/main/java/com/edu/assessment/dto/request/RegisterRequest.java` |

**Mô tả:**  
DTO `RegisterRequest` chỉ kiểm tra `@NotBlank` (không rỗng) cho trường `phoneNumber`, nhưng thiếu Regex pattern để validate định dạng số điện thoại Việt Nam (10 số, bắt đầu bằng 0). Hệ thống chấp nhận đăng ký với SĐT như `"01234"`, `"abc"`, hay `"!!!"`.

**Cách sửa đã áp dụng:**
```java
// RegisterRequest.java — đã thêm @Pattern bên dưới @NotBlank:
@NotBlank(message = "Số điện thoại không được để trống")
@Pattern(regexp = "^(0[3|5|7|8|9])[0-9]{8}$",
         message = "Số điện thoại không hợp lệ (phải là số VN 10 chữ số, bắt đầu bằng 03/05/07/08/09)")
private String phoneNumber;
```

> ✅ **Đã xác nhận qua API:** `POST /auth/register` với `phoneNumber: "01234"` trả về **400** với message validation đúng.

---

## 🟡 BUG #5 — [MEDIUM] Bảng class_members thiếu Unique Constraint ở tầng Database

| Thuộc tính | Chi tiết |
|---|---|
| **Mức độ** | 🟡 Medium |
| **Trạng thái** | ✅ Đã vá |
| **File liên quan** | `be/backend/src/main/java/com/edu/assessment/entity/ClassMember.java` |

**Mô tả:**  
Luồng `joinClass` kiểm tra `existingMember` trước rồi mới `save()`, nhưng không có database-level Unique Constraint trên cặp `(class_id, student_id)` trong bảng `class_members`. Nếu cùng một học sinh spam join đồng thời ở mức cao hơn (hàng trăm request/giây), lý thuyết có thể tạo ra bản ghi trùng lặp — giống Race Condition đã xảy ra ở Bug #2.

**Cách sửa đã áp dụng:**
```java
// ClassMember.java — đã thêm uniqueConstraints vào @Table:
@Table(name = "class_members", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"class_id", "student_id"})
})
```

---

## 🔴 BUG #6 — [HIGH] Không validate startTime > endTime khi tạo đề thi

| Thuộc tính | Chi tiết |
|---|---|
| **Mức độ** | 🟠 High |
| **Trạng thái** | ✅ Đã vá |
| **File liên quan** | `be/backend/src/main/java/com/edu/assessment/service/ExamService.java` |
| **File liên quan** | `be/backend/src/main/java/com/edu/assessment/pages/teacher/CreateExam.jsx` |

**Mô tả:**  
Hệ thống không kiểm tra ràng buộc `startTime < endTime` khi giáo viên tạo đề thi. Có thể tạo đề với thời gian bắt đầu **sau** thời gian kết thúc, khiến không ai có thể làm bài được nhưng đề vẫn được lưu vào DB.

**Cách sửa đã áp dụng:**
- **Backend (`ExamService.java`):** Thêm kiểm tra logic sau khi parse startTime/endTime:
```java
// ExamService.java — createExam method:
if (!request.getStartTime().isBefore(request.getEndTime())) {
    throw new IllegalArgumentException("Thời gian kết thúc phải sau thời gian bắt đầu!");
}
```
- **Frontend (`CreateExam.jsx`):** Thêm validation client-side trước khi submit:
```js
if (new Date(startTime) >= new Date(endTime)) {
    showToast("Thời gian bắt đầu phải trước thời gian kết thúc!", "error");
    return;
}
```

---

## 🟡 BUG #7 — [MEDIUM] Câu số (questionNumber) trùng lặp trong answerKeys không bị chặn

| Thuộc tính | Chi tiết |
|---|---|
| **Mức độ** | 🟡 Medium |
| **Trạng thái** | ✅ Đã vá |
| **File liên quan** | `be/backend/src/main/java/com/edu/assessment/service/ExamService.java` |

**Mô tả:**  
Vòng lặp tạo `ExamQuestion` không kiểm tra `questionNumber` trùng lặp trong `answerKeys`. Có thể tạo đề với 2 câu hỏi số 1, gây lẫn lộn khi chấm điểm.

**Cách sửa đã áp dụng:**
```java
// ExamService.java — createExam, trước vòng lặp tạo questions:
Set<Integer> usedNumbers = new HashSet<>();
for (CreateExamRequest.QuestionAnswerDto dto : request.getAnswerKeys()) {
    if (!usedNumbers.add(dto.getQuestionNumber())) {
        throw new IllegalArgumentException("Số thứ tự câu hỏi " + dto.getQuestionNumber() + " bị trùng lặp trong danh sách đáp án!");
    }
    ...
}
```

---

## 🟡 BUG #8 — [MEDIUM] Không validate điểm âm (points < 0) trong answerKeys

| Thuộc tính | Chi tiết |
|---|---|
| **Mức độ** | 🟡 Medium |
| **Trạng thái** | ✅ Đã vá |
| **File liên quan** | `be/backend/src/main/java/com/edu/assessment/dto/request/CreateExamRequest.java` |

**Mô tả:**  
Trường `points` trong `QuestionAnswerDto` thiếu annotation `@Min(0)`. Giáo viên có thể nhập điểm âm (ví dụ `-1`), không vi phạm tổng > 10.0 nên qua được kiểm tra, nhưng học sinh sẽ bị trừ điểm khi làm đúng.

**Cách sửa đã áp dụng:**
```java
// CreateExamRequest.java — trong QuestionAnswerDto:
@NotNull
@DecimalMin(value = "0.0", inclusive = false, message = "Điểm số mỗi câu phải lớn hơn 0!")
private Double points;
```

---

## 🟠 BUG #9 — [HIGH] Title đề thi quá dài gây DB truncation (500 Server Error)

| Thuộc tính | Chi tiết |
|---|---|
| **Mức độ** | 🟠 High |
| **Trạng thái** | ✅ Đã vá |
| **File liên quan** | `be/backend/src/main/java/com/edu/assessment/dto/request/CreateExamRequest.java` |

**Mô tả:**  
Trường `title` không có giới hạn độ dài (`@Size`). Khi truyền vào chuỗi 5000 ký tự, MySQL báo lỗi `Data truncation: Data too long for column 'title'` và Backend trả về **500 Lỗi hệ thống** thô thay vì 400 thân thiện.

**Cách sửa đã áp dụng:**
```java
// CreateExamRequest.java:
@NotBlank(message = "Tên bài kiểm tra không được để trống")
@Size(max = 255, message = "Tên bài kiểm tra không được vượt quá 255 ký tự!")
private String title;
```

---

## 🟡 BUG #10 — [MEDIUM] Tạo đề với PART2 correctAnswer sai định dạng vẫn được chấp nhận

| Thuộc tính | Chi tiết |
|---|---|
| **Mức độ** | 🟡 Medium |
| **Trạng thái** | ✅ Đã vá |
| **File liên quan** | `be/backend/src/main/java/com/edu/assessment/service/ExamService.java` |

**Mô tả:**  
Engine chấm điểm yêu cầu đáp án PART_2_TRUE_FALSE phải có format `"T,T,F,T"` (4 phần ngăn cách bằng dấu phẩy). Tuy nhiên khi tạo đề, không có bước validate format này. Giáo viên có thể nhập `"TTFT"` (không có dấu phẩy) — đề được tạo thành công nhưng **học sinh làm câu đó sẽ không bao giờ được điểm** dù trả lời đúng.

**Cách sửa đã áp dụng:**
```java
// ExamService.java — trong vòng lặp tạo questions:
if (partType == ExamQuestion.PartType.PART_2_TRUE_FALSE) {
    String[] parts = cleanAnswer.split(",");
    if (parts.length != 4) throw new IllegalArgumentException(
        "Đáp án câu Đúng/Sai số " + dto.getQuestionNumber()
        + " phải có đúng 4 phần ngăn cách bằng dấu phẩy (vd: T,T,F,T)! Hiện tại có " + parts.length + " phần.");
}
```

---

## 🟡 BUG #11 — [MEDIUM] Tất cả các câu hỏi có points=0 vẫn tạo đề thành công

| Thuộc tính | Chi tiết |
|---|---|
| **Mức độ** | 🟡 Medium |
| **Trạng thái** | ✅ Đã vá |
| **File liên quan** | `be/backend/src/main/java/com/edu/assessment/service/ExamService.java` |

**Mô tả:**  
Không có kiểm tra tổng điểm tối thiểu > 0. Có thể tạo đề với toàn bộ câu hỏi có `points=0`, dẫn đến bài thi vô nghĩa — học sinh làm đúng hay sai đều được 0 điểm.

**Cách sửa đã áp dụng:**
```java
// ExamService.java — createExam, sau khi tính totalConfiguredPoints:
if (totalConfiguredPoints <= 0.0) {
    throw new IllegalArgumentException("Tổng điểm toàn bài phải lớn hơn 0!");
}
```

> ⚠️ **Lưu ý:** Bug #8 fix `@DecimalMin(inclusive=false)` đã chặn từng câu points=0, Bug #11 là lớp bảo vệ tổng thể thứ 2 ở tầng service.

---

## 🟡 BUG #12 — [MEDIUM] correctAnswer là chuỗi rỗng `""` được chấp nhận

| Thuộc tính | Chi tiết |
|---|---|
| **Mức độ** | 🟡 Medium |
| **Trạng thái** | ✅ Đã vá |
| **File liên quan** | `be/backend/src/main/java/com/edu/assessment/service/ExamService.java` |

**Mô tả:**  
`@NotBlank` trên `correctAnswer` không phát huy tác dụng khi `GlobalExceptionHandler` chưa được bắt đúng cách. Chuỗi `""` bị `trim().toUpperCase()` thành `""` và lưu vào DB — học sinh không thể có đáp án khớp.

**Cách sửa đã áp dụng:**
```java
// ExamService.java — sau khi cleanAnswer = dto.getCorrectAnswer().trim().toUpperCase():
if (cleanAnswer.isEmpty()) {
    throw new IllegalArgumentException("Đáp án câu số " + dto.getQuestionNumber() + " không được để trống!");
}
```

---

## 🟡 BUG #13 — [MEDIUM] questionNumber âm hoặc bằng 0 không bị chặn

| Thuộc tính | Chi tiết |
|---|---|
| **Mức độ** | 🟡 Medium |
| **Trạng thái** | ✅ Đã vá |
| **File liên quan** | `be/backend/src/main/java/com/edu/assessment/service/ExamService.java` |

**Mô tả:**  
`questionNumber` trong `QuestionAnswerDto` không có `@Min(1)`. Có thể tạo câu hỏi số 0 hoặc số âm (-5), gây lộn xộn thứ tự hiển thị và mất đồng bộ dữ liệu.

**Cách sửa đã áp dụng:**
```java
// ExamService.java — đầu vòng lặp tạo questions:
if (dto.getQuestionNumber() == null || dto.getQuestionNumber() < 1) {
    throw new IllegalArgumentException("Số thứ tự câu hỏi phải bắt đầu từ 1, không được âm hoặc bằng 0!");
}
```

---

## 🟠 BUG #14 — [HIGH] Nộp bài với `answers` là String thay vì Array gây 500

| Thuộc tính | Chi tiết |
|---|---|
| **Mức độ** | 🟠 High |
| **Trạng thái** | ✅ Đã vá |
| **File liên quan** | `be/backend/src/main/java/com/edu/assessment/exception/GlobalExceptionHandler.java` |

**Mô tả:**  
Khi gửi `"answers": "INVALID_NOT_ARRAY"` (string thay vì array), Jackson không thể deserialize và ném `HttpMessageNotReadableException`. Handler này chưa được bắt riêng trong `GlobalExceptionHandler`, nên trả về **500** thay vì **400 Bad Request**.

**Cách sửa đã áp dụng:**
```java
// GlobalExceptionHandler.java — đã thêm handler:
@ExceptionHandler(HttpMessageNotReadableException.class)
public ResponseEntity<Map<String, String>> handleHttpMessageNotReadable(HttpMessageNotReadableException e) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(Map.of("message", "Định dạng dữ liệu gửi lên không hợp lệ! Vui lòng kiểm tra lại cấu trúc JSON."));
}
```

---

## 🟠 BUG #15 — [HIGH] Câu trả lời quá dài (10000 ký tự) gây DB truncation 500

| Thuộc tính | Chi tiết |
|---|---|
| **Mức độ** | 🟠 High |
| **Trạng thái** | ✅ Đã vá |
| **File liên quan** | `be/backend/src/main/java/com/edu/assessment/entity/SubmissionAnswer.java` |
| **File liên quan** | `be/backend/src/main/java/com/edu/assessment/dto/request/SubmitExamRequest.java` |

**Mô tả:**  
Trường `studentAnswer` trong `SubmissionAnswer` entity không giới hạn độ dài (`@Column(length=...)`). Khi học sinh gửi câu trả lời 10000 ký tự (ví dụ tấn công buffer), MySQL báo `Data truncation: Data too long for column 'student_answer'` và hệ thống trả về **500**.

**Cách sửa đã áp dụng:**
```java
// SubmitExamRequest.java — trong AnswerDto:
@Size(max = 500, message = "Câu trả lời không được vượt quá 500 ký tự!")
private String studentAnswer;

// SubmissionAnswer.java — entity:
@Column(name = "student_answer", length = 500)
private String studentAnswer;
```

---

## 🟡 BUG #16 — [MEDIUM] timeSpentSeconds âm được chấp nhận

| Thuộc tính | Chi tiết |
|---|---|
| **Mức độ** | 🟡 Medium |
| **Trạng thái** | ✅ Đã vá |
| **File liên quan** | `be/backend/src/main/java/com/edu/assessment/dto/request/SubmitExamRequest.java` |

**Mô tả:**  
`timeSpentSeconds` không có `@Min(0)`, cho phép gửi giá trị âm (ví dụ `-1`, `-9999999`). Hệ thống lưu vào DB giá trị không hợp lý, làm sai lệch báo cáo thời gian làm bài của học sinh.

**Cách sửa đã áp dụng:**
```java
// SubmitExamRequest.java:
@NotNull(message = "Thời gian làm bài không được để trống")
@Min(value = 0, message = "Thời gian làm bài không được âm!")
private Integer timeSpentSeconds;
```

---

## 🟡 BUG #17 — [LOW] questionId=null trong answers không bị reject, chỉ bị bỏ qua

| Thuộc tính | Chi tiết |
|---|---|
| **Mức độ** | 🟡 Low |
| **Trạng thái** | ✅ Đã vá |
| **File liên quan** | `be/backend/src/main/java/com/edu/assessment/dto/request/SubmitExamRequest.java` |

**Mô tả:**  
Khi `answers` chứa `{ questionId: null, studentAnswer: "A" }`, thay vì trả về lỗi validation, hệ thống nhận và xử lý bình thường — `questionMap.get(null)` trả về `null` nên bị `continue` bỏ qua. Bài thi vẫn được chấm bình thường nhưng không có lỗi rõ ràng.

**Cách sửa đã áp dụng:**
```java
// SubmitExamRequest.java — trong AnswerDto:
@NotNull  // ← Thêm annotation này, kết hợp với @Valid ở cấp trên
private Long questionId;
```

---

## ✅ KẾT QUẢ TÍCH CỰC TỪ MEGA TEST

| Hạng mục | Kết quả |
|---|---|
| 20 GV tạo đề đồng thời (valid) | ✅ 100% thành công trong 33ms |
| 20 HS GET /take đồng thời | ✅ 20/20 OK trong 45ms |
| 20 HS nộp bài đồng thời | ✅ 20/20 xử lý đúng trong 47ms |
| Anti-cheat: Đáp án bị lộ | ✅ KHÔNG BỊ LỘ — An toàn tuyệt đối |
| SQL Injection trong đáp án | ✅ An toàn (JPA parameterized) |
| Unicode bomb trong đáp án | 🟡 Được lưu vào DB nhưng không gây crash |
| Double submit (S20) | ✅ Chỉ 1 bài được chấp nhận |
| Lowercase answers | ✅ normalize `.toUpperCase()` hoạt động đúng |
| Comma format (3,14 = 3.14) | ✅ Engine nhận dạng và chuyển đổi đúng |

---

## 📈 Tổng kết (Cập nhật 2026-08-18 — Sau khi hoàn tất sửa lỗi)

| Mức độ | Số lỗi | Đã vá | Chưa vá |
|---|---|---|---|
| 🔴 Critical | 1 | 1 | 0 |
| 🟠 High | 6 | 6 | 0 |
| 🟡 Medium | 9 | 9 | 0 |
| 🟡 Low | 1 | 1 | 0 |
| **Tổng** | **17** | **17** | **0** |

### ✅ Tất cả 17 bug đã được vá hoàn toàn!

**Tóm tắt các thay đổi theo file:**

| File | Bug đã fix |
|---|---|
| `ExamService.java` | #6 (startTime), #7 (questionNumber trùng), #10 (PART2 format), #11 (tổng điểm=0), #12 (correctAnswer rỗng), #13 (questionNumber âm), Scoring Engine #1 |
| `GlobalExceptionHandler.java` | #2 (DataIntegrityViolation→400), #3 (MethodArgumentNotValid→400, AccessDenied→403), #14 (HttpMessageNotReadable→400) |
| `CreateExamRequest.java` | #8 (@DecimalMin points>0), #9 (@Size max=255 title) |
| `RegisterRequest.java` | #4 (@Pattern phone VN) |
| `SubmitExamRequest.java` | #15 (@Size max=500 studentAnswer), #16 (@Min(0) timeSpentSeconds), #17 (@NotNull questionId), #1 (@Size max=28 answers) |
| `SubmissionAnswer.java` | #15 (@Column length=500) |
| `ClassMember.java` | #5 (@UniqueConstraint class_id+student_id) |
