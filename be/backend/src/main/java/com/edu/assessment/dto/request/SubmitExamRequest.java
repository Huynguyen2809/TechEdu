package com.edu.assessment.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class SubmitExamRequest {
    @NotNull(message = "Thời gian làm bài không được để trống")
    private Integer timeSpentSeconds; // Học sinh làm hết bao nhiêu giây

    @NotEmpty(message = "Danh sách câu trả lời không được để trống")
    private List<AnswerDto> answers;

    @Data
    public static class AnswerDto {
        @NotNull private Long questionId; // ID của câu hỏi trong bảng exam_questions
        private String studentAnswer; // Có thể null hoặc rỗng nếu học sinh bỏ qua không làm
    }
}