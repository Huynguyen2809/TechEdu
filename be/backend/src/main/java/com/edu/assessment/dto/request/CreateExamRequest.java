package com.edu.assessment.dto.request;

import jakarta.validation.constraints.*;
import jakarta.validation.Valid;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class CreateExamRequest {
    @NotBlank(message = "Tên bài kiểm tra không được để trống")
    @Size(max = 255, message = "Tên bài kiểm tra không được vượt quá 255 ký tự!") // [FIX Bug #9]
    private String title;

    @NotNull(message = "Chưa chọn lớp học")
    private Long classId;

    @NotNull(message = "Chưa chọn đề thi PDF")
    private Long documentId;

    private Long explanationDocumentId; // File PDF Lời giải chi tiết (tùy chọn)
    private String explanationPolicy;   // IMMEDIATELY, AFTER_EXAM_END, NEVER

    @NotNull @Min(5)
    private Integer durationMinutes;

    @NotNull
    private LocalDateTime startTime;

    @NotNull
    private LocalDateTime endTime;

    // Cấu hình số câu từng phần
    @NotNull @Min(0) private Integer part1Count;
    @NotNull @Min(0) private Integer part2Count;
    @NotNull @Min(0) private Integer part3Count;

    // Danh sách đáp án chuẩn do giáo viên cấu hình
    // Danh sách đáp án chuẩn do giáo viên cấu hình
    @Valid // Kích hoạt validate các trường bên trong QuestionAnswerDto
    @NotEmpty(message = "Danh sách đáp án chuẩn không được để trống")
    private List<QuestionAnswerDto> answerKeys;

    @Data
    public static class QuestionAnswerDto {
        @NotNull private Integer questionNumber; // [FIX Bug #13] sẽ check @Min(1) ở Service
        @NotBlank private String partType; // PART_1_ABCD, PART_2_TRUE_FALSE, PART_3_SHORT_ANSWER
        @NotBlank private String correctAnswer;
        @NotNull
        @DecimalMin(value = "0.0", inclusive = false, message = "[FIX Bug #8] Điểm số mỗi câu phải lớn hơn 0!") // [FIX Bug #8]
        private Double points;
    }
}