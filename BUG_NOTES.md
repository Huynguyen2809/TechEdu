# 📋 Bug Notes — Hệ thống Kiểm tra Đánh giá Trực tuyến

**Ngày kiểm tra:** 2026-08-17  
**Phương pháp:** API Integration Testing + Concurrent Load Testing (20 Virtual Users)  
**Tổng số lỗi phát hiện:** 5 lỗi (1 Critical, 2 High, 2 Medium)

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
| **Trạng thái** | ⚠️ Chưa vá hoàn toàn *(DB Unique Key đang làm van cuối, nhưng UX xấu)* |
| **File liên quan** | `be/backend/src/main/java/com/edu/assessment/service/ExamService.java` |

**Mô tả:**  
Khi cùng một học sinh bắn 2 request nộp bài thi **đồng thời** (cùng mili-giây), cả 2 request vào `submitExam` trước khi transaction đầu tiên commit. Lớp kiểm tra logic `existsByExamIdAndStudentId` bị vượt qua do hai transaction chạy song song (TOCTOU — Time-of-Check-Time-of-Use bug). Kết quả:
- Database Unique Key (`UKbbl161lhoispxt052w1b498bq`) cứu vãn, chỉ 1 bản ghi được lưu ✅
- Request "thua" trả về **`500 Lỗi hệ thống`** thay vì `400 Bad Request` thân thiện ❌

**Chứng minh (PoC):**
```
Race Test Output:
  Request 1: 500 — "Lỗi hệ thống: Duplicate entry '9-29'..."
  Request 2: 200 — totalScore: 4.5
```

**Cách sửa đề xuất:**
```java
// ExamService.java — submitExam method
// Thay @Transactional thành:
@Transactional(isolation = Isolation.SERIALIZABLE)
// Hoặc thêm pessimistic lock trước khi check:
examSubmissionRepository.findByExamIdAndStudentIdForUpdate(examId, studentId);
```

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

**Cách sửa đã áp dụng:** Thêm 2 handler riêng biệt cho `MethodArgumentNotValidException` (→ 400) và `AccessDeniedException` (→ 403).

---

## 🟡 BUG #4 — [MEDIUM] Không validate định dạng Số điện thoại khi Đăng ký

| Thuộc tính | Chi tiết |
|---|---|
| **Mức độ** | 🟡 Medium |
| **Trạng thái** | ❌ Chưa vá |
| **File liên quan** | `be/backend/src/main/java/com/edu/assessment/dto/request/RegisterRequest.java` |

**Mô tả:**  
DTO `RegisterRequest` chỉ kiểm tra `@NotBlank` (không rỗng) cho trường `phoneNumber`, nhưng thiếu Regex pattern để validate định dạng số điện thoại Việt Nam (10 số, bắt đầu bằng 0). Hệ thống chấp nhận đăng ký với SĐT như `"01234"`, `"abc"`, hay `"!!!"`.

**Chứng minh (PoC):**
```
POST /auth/register  { phoneNumber: "01234", ... }
→ 200 OK — "Đăng ký tài khoản thành công!"  ← LỖI
```

**Cách sửa đề xuất:**
```java
// RegisterRequest.java — thêm annotation bên dưới @NotBlank
@Pattern(regexp = "^(0[3|5|7|8|9])[0-9]{8}$",
         message = "Số điện thoại không hợp lệ (phải là số VN 10 chữ số, bắt đầu bằng 03/05/07/08/09)")
private String phoneNumber;
```

---

## 🟡 BUG #5 — [MEDIUM] Bảng class_members thiếu Unique Constraint ở tầng Database

| Thuộc tính | Chi tiết |
|---|---|
| **Mức độ** | 🟡 Medium |
| **Trạng thái** | ⚠️ Chưa vá *(hiện tại không gây ra lỗi nhưng thiếu lớp bảo vệ ở tầng DB)* |
| **File liên quan** | `be/backend/src/main/java/com/edu/assessment/entity/ClassMember.java` |

**Mô tả:**  
Luồng `joinClass` kiểm tra `existingMember` trước rồi mới `save()`, nhưng không có database-level Unique Constraint trên cặp `(class_id, student_id)` trong bảng `class_members`. Nếu cùng một học sinh spam join đồng thời ở mức cao hơn (hàng trăm request/giây), lý thuyết có thể tạo ra bản ghi trùng lặp — giống Race Condition đã xảy ra ở Bug #2.

**Cách sửa đề xuất:**
```java
// ClassMember.java — thêm uniqueConstraints vào @Table
@Table(name = "class_members",
       uniqueConstraints = @UniqueConstraint(columnNames = {"class_id", "student_id"}))
```
```sql
-- Hoặc chạy SQL Migration trực tiếp:
ALTER TABLE class_members ADD UNIQUE KEY uk_class_student (class_id, student_id);
```

---

---

## 🔴 BUG #6 — [HIGH] Không validate startTime > endTime khi tạo đề thi

| Thuộc tính | Chi tiết |
|---|---|
| **Mức độ** | 🟠 High |
| **Trạng thái** | ❌ Chưa vá |
| **File liên quan** | `be/backend/src/main/java/com/edu/assessment/service/ExamService.java` |
| **File liên quan** | `be/backend/src/main/java/com/edu/assessment/dto/request/CreateExamRequest.java` |

**Mô tả:**  
Hệ thống không kiểm tra ràng buộc `startTime < endTime` khi giáo viên tạo đề thi. Có thể tạo đề với thời gian bắt đầu **sau** thời gian kết thúc, khiến không ai có thể làm bài được nhưng đề vẫn được lưu vào DB.

**Chứng minh (PoC):**
```
POST /exams  { startTime: "2026-08-18", endTime: "2026-08-16" }
→ 200 OK — "Tạo bài kiểm tra thành công!"  ← LỖI
```

**Cách sửa đề xuất:**
```java
// ExamService.java — trong createExam, sau khi parse startTime/endTime:
if (!request.getStartTime().isBefore(request.getEndTime())) {
    throw new IllegalArgumentException("Thời gian kết thúc phải sau thời gian bắt đầu!");
}
```

---

## 🟡 BUG #7 — [MEDIUM] Câu số (questionNumber) trùng lặp trong answerKeys không bị chặn

| Thuộc tính | Chi tiết |
|---|---|
| **Mức độ** | 🟡 Medium |
| **Trạng thái** | ❌ Chưa vá |
| **File liên quan** | `be/backend/src/main/java/com/edu/assessment/service/ExamService.java` |

**Mô tả:**  
Vòng lặp tạo `ExamQuestion` không kiểm tra `questionNumber` trùng lặp trong `answerKeys`. Có thể tạo đề với 2 câu hỏi số 1, gây lẫn lộn khi chấm điểm.

**Chứng minh (PoC):**
```
answerKeys: [ {questionNumber: 1, answer: "A"}, {questionNumber: 1, answer: "B"} ]
→ 200 OK — 2 bản ghi exam_questions với question_number=1 được lưu vào DB  ← LỖI
```

**Cách sửa đề xuất:**
```java
// ExamService.java — trước vòng lặp tạo questions:
Set<Integer> usedNumbers = new HashSet<>();
for (CreateExamRequest.QuestionAnswerDto dto : request.getAnswerKeys()) {
    if (!usedNumbers.add(dto.getQuestionNumber())) {
        throw new IllegalArgumentException("Số thứ tự câu hỏi " + dto.getQuestionNumber() + " bị trùng lặp!");
    }
    ...
}
```

---

## 🟡 BUG #8 — [MEDIUM] Không validate điểm âm (points < 0) trong answerKeys

| Thuộc tính | Chi tiết |
|---|---|
| **Mức độ** | 🟡 Medium |
| **Trạng thái** | ❌ Chưa vá |
| **File liên quan** | `be/backend/src/main/java/com/edu/assessment/dto/request/CreateExamRequest.java` |

**Mô tả:**  
Trường `points` trong `QuestionAnswerDto` thiếu annotation `@Min(0)`. Giáo viên có thể nhập điểm âm (ví dụ `-1`), không vi phạm tổng > 10.0 nên qua được kiểm tra, nhưng học sinh sẽ bị trừ điểm khi làm đúng.

**Chứng minh (PoC):**
```
answerKeys: [ {questionNumber: 1, correctAnswer: "A", points: -1.0} ]
→ 200 OK — Đề được tạo, học sinh trả lời đúng câu 1 bị -1 điểm  ← LỖI
```

**Cách sửa đề xuất:**
```java
// CreateExamRequest.java — trong QuestionAnswerDto:
@NotNull
@DecimalMin(value = "0.0", message = "Điểm số không được âm!")
private Double points;
```
*(Cần import: `import jakarta.validation.constraints.DecimalMin;`)*

---

## 🔴 BUG #9 — [HIGH] Title đề thi quá dài gây DB truncation (500 Server Error)

| Thuộc tính | Chi tiết |
|---|---|
| **Mức độ** | 🟠 High |
| **Trạng thái** | ❌ Chưa vá |
| **File liên quan** | `be/backend/src/main/java/com/edu/assessment/dto/request/CreateExamRequest.java` |
| **File liên quan** | `be/backend/src/main/java/com/edu/assessment/entity/Exam.java` |

**Mô tả:**  
Trường `title` không có giới hạn độ dài (`@Size`). Khi truyền vào chuỗi 5000 ký tự, MySQL báo lỗi `Data truncation: Data too long for column 'title'` và Backend trả về **500 Lỗi hệ thống** thô thay vì 400 thân thiện.

**Chứng minh (PoC):**
```
POST /exams  { title: "A".repeat(5000) }
→ 500 — "Lỗi hệ thống: could not execute statement [Data truncation...]"  ← LỖI
```

**Cách sửa đề xuất:**
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
| **Trạng thái** | ❌ Chưa vá |
| **File liên quan** | `be/backend/src/main/java/com/edu/assessment/service/ExamService.java` |

**Mô tả:**  
Engine chấm điểm yêu cầu đáp án PART_2_TRUE_FALSE phải có format `"T,T,F,T"` (4 phần ngăn cách bằng dấu phẩy). Tuy nhiên khi tạo đề, không có bước validate format này. Giáo viên có thể nhập `"TTFT"` (không có dấu phẩy) — đề được tạo thành công nhưng **học sinh làm câu đó sẽ không bao giờ được điểm** dù trả lời đúng.

**PoC:** `correctAnswer: "TTFT"` → 200 OK. Khi HS submit `"T,T,F,T"` → 0 điểm (do split(",") ra 1 phần tử ≠ 4).

**Cách sửa đề xuất:**
```java
// ExamService.java — trong vòng lặp tạo questions:
if (partType == ExamQuestion.PartType.PART_2_TRUE_FALSE) {
    String[] parts = cleanAnswer.split(",");
    if (parts.length != 4) throw new IllegalArgumentException(
        "Đáp án câu Đúng/Sai phải có đúng 4 phần ngăn cách bằng dấu phẩy (vd: T,T,F,T)!");
}
```

---

## 🟡 BUG #11 — [MEDIUM] Tất cả các câu hỏi có points=0 vẫn tạo đề thành công

| Thuộc tính | Chi tiết |
|---|---|
| **Mức độ** | 🟡 Medium |
| **Trạng thái** | ❌ Chưa vá |
| **File liên quan** | `be/backend/src/main/java/com/edu/assessment/service/ExamService.java` |

**Mô tả:**  
Không có kiểm tra tổng điểm tối thiểu > 0. Có thể tạo đề với toàn bộ câu hỏi có `points=0`, dẫn đến bài thi vô nghĩa — học sinh làm đúng hay sai đều được 0 điểm.

**Cách sửa đề xuất:**
```java
if (totalConfiguredPoints == 0.0) {
    throw new IllegalArgumentException("Tổng điểm toàn bài không thể bằng 0!");
}
```

---

## 🟡 BUG #12 — [MEDIUM] correctAnswer là chuỗi rỗng `""` được chấp nhận

| Thuộc tính | Chi tiết |
|---|---|
| **Mức độ** | 🟡 Medium |
| **Trạng thái** | ❌ Chưa vá |
| **File liên quan** | `be/backend/src/main/java/com/edu/assessment/dto/request/CreateExamRequest.java` |

**Mô tả:**  
`@NotBlank` trên `correctAnswer` không phát huy tác dụng khi `GlobalExceptionHandler` chưa được bắt đúng cách. Chuỗi `""` bị `trim().toUpperCase()` thành `""` và lưu vào DB — học sinh không thể có đáp án khớp.

**PoC:** `correctAnswer: ""` → 200 OK — đề được tạo, mọi học sinh đều bị 0 điểm câu này.

---

## 🟡 BUG #13 — [MEDIUM] questionNumber âm hoặc bằng 0 không bị chặn

| Thuộc tính | Chi tiết |
|---|---|
| **Mức độ** | 🟡 Medium |
| **Trạng thái** | ❌ Chưa vá |
| **File liên quan** | `be/backend/src/main/java/com/edu/assessment/dto/request/CreateExamRequest.java` |

**Mô tả:**  
`questionNumber` trong `QuestionAnswerDto` không có `@Min(1)`. Có thể tạo câu hỏi số 0 hoặc số âm (-5), gây lộn xộn thứ tự hiển thị và mất đồng bộ dữ liệu.

**Cách sửa đề xuất:**
```java
// CreateExamRequest.java — trong QuestionAnswerDto:
@NotNull @Min(value = 1, message = "Số thứ tự câu hỏi phải bắt đầu từ 1!")
private Integer questionNumber;
```

---

## 🟠 BUG #14 — [HIGH] Nộp bài với `answers` là String thay vì Array gây 500

| Thuộc tính | Chi tiết |
|---|---|
| **Mức độ** | 🟠 High |
| **Trạng thái** | ❌ Chưa vá |
| **File liên quan** | `be/backend/src/main/java/com/edu/assessment/exception/GlobalExceptionHandler.java` |

**Mô tả:**  
Khi gửi `"answers": "INVALID_NOT_ARRAY"` (string thay vì array), Jackson không thể deserialize và ném `HttpMessageNotReadableException`. Handler này chưa được bắt riêng trong `GlobalExceptionHandler`, nên trả về **500** thay vì **400 Bad Request**.

**PoC:** `{ answers: "INVALID" }` → `500 Lỗi hệ thống: JSON parse error: Cannot deserialize...`

**Cách sửa đề xuất:**
```java
// GlobalExceptionHandler.java — thêm handler:
import org.springframework.http.converter.HttpMessageNotReadableException;

@ExceptionHandler(HttpMessageNotReadableException.class)
public ResponseEntity<Map<String, String>> handleHttpMessageNotReadable(HttpMessageNotReadableException e) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(Map.of("message", "Định dạng dữ liệu gửi lên không hợp lệ!"));
}
```

---

## 🟠 BUG #15 — [HIGH] Câu trả lời quá dài (10000 ký tự) gây DB truncation 500

| Thuộc tính | Chi tiết |
|---|---|
| **Mức độ** | 🟠 High |
| **Trạng thái** | ❌ Chưa vá |
| **File liên quan** | `be/backend/src/main/java/com/edu/assessment/entity/SubmissionAnswer.java` |
| **File liên quan** | `be/backend/src/main/java/com/edu/assessment/dto/request/SubmitExamRequest.java` |

**Mô tả:**  
Trường `studentAnswer` trong `SubmissionAnswer` entity không giới hạn độ dài (`@Column(length=...)`). Khi học sinh gửi câu trả lời 10000 ký tự (ví dụ tấn công buffer), MySQL báo `Data truncation: Data too long for column 'student_answer'` và hệ thống trả về **500**.

**PoC:** `studentAnswer: "X".repeat(10000)` → `500 Lỗi hệ thống: Data truncation...`

**Cách sửa đề xuất:**
```java
// SubmitExamRequest.java — trong AnswerDto:
@Size(max = 500, message = "Câu trả lời không được vượt quá 500 ký tự!")
private String studentAnswer;

// SubmissionAnswer.java — entity:
@Column(length = 500)
private String studentAnswer;
```

---

## 🟡 BUG #16 — [MEDIUM] timeSpentSeconds âm được chấp nhận

| Thuộc tính | Chi tiết |
|---|---|
| **Mức độ** | 🟡 Medium |
| **Trạng thái** | ❌ Chưa vá |
| **File liên quan** | `be/backend/src/main/java/com/edu/assessment/dto/request/SubmitExamRequest.java` |

**Mô tả:**  
`timeSpentSeconds` không có `@Min(0)`, cho phép gửi giá trị âm (ví dụ `-1`, `-9999999`). Hệ thống lưu vào DB giá trị không hợp lý, làm sai lệch báo cáo thời gian làm bài của học sinh.

**Cách sửa đề xuất:**
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
| **Trạng thái** | ❌ Chưa vá |
| **File liên quan** | `be/backend/src/main/java/com/edu/assessment/service/ExamService.java` |

**Mô tả:**  
Khi `answers` chứa `{ questionId: null, studentAnswer: "A" }`, thay vì trả về lỗi validation, hệ thống nhận và xử lý bình thường — `questionMap.get(null)` trả về `null` nên bị `continue` bỏ qua. Bài thi vẫn được chấm bình thường nhưng không có lỗi rõ ràng.

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

## 📈 Tổng kết (Cập nhật sau Mega Test)

| Mức độ | Số lỗi | Đã vá | Chưa vá |
|---|---|---|---|
| 🔴 Critical | 1 | 1 | 0 |
| 🟠 High | 6 | 1 | 5 |
| 🟡 Medium | 9 | 0 | 9 |
| 🟡 Low | 1 | 0 | 1 |
| **Tổng** | **17** | **2** | **15** |

**Thứ tự ưu tiên vá (còn lại):**
1. **Bug #14** — `HttpMessageNotReadableException` → 500 (thêm handler)
2. **Bug #15** — Student answer 10000 chars → DB truncation 500
3. **Bug #9** — Exam title quá dài → DB truncation 500
4. **Bug #6** — startTime > endTime không bị chặn
5. **Bug #2** — Race Condition nộp bài (Isolation Level)
6. **Bug #10** — PART2 format sai vẫn tạo được đề
7. **Bug #7** — questionNumber trùng lặp trong answerKeys
8. **Bug #8** — points âm (-0.5) được chấp nhận
9. **Bug #16** — timeSpentSeconds âm được chấp nhận
10. **Bug #13** — questionNumber=0 hoặc âm được chấp nhận
11. **Bug #11** — Tổng điểm = 0 vẫn tạo được đề
12. **Bug #12** — correctAnswer="" (chuỗi rỗng) được chấp nhận
13. **Bug #5** — class_members thiếu Unique Constraint DB
14. **Bug #4** — Validate định dạng SĐT
15. **Bug #17** — questionId=null bị bỏ qua không báo lỗi
