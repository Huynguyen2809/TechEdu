package com.edu.assessment.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Min;
import jakarta.validation.Valid;
import lombok.Data;
import java.util.List;

@Data
public class SubmitExamRequest {
    @NotNull(message = "Thời gian làm bài không được để trống")
    @Min(value = 0, message = "Thời gian làm bài không được âm!") // [FIX Bug #16]
    private Integer timeSpentSeconds; // Học sinh làm hết bao nhiêu giây

    @Min(value = 0)
    private Integer warningCount = 0;

    @Valid // Kích hoạt validate cho các phần tử bên trong
    @NotEmpty(message = "Danh sách câu trả lời không được để trống")
    @Size(max = 28, message = "Số lượng câu trả lời vượt quá giới hạn cho phép (tối đa 28 câu theo quy chế GD&ĐT 2025)!")
    private List<AnswerDto> answers;

    @Data
    public static class AnswerDto {
        @NotNull private Long questionId;
        @Size(max = 500, message = "Câu trả lời không được vượt quá 500 ký tự!") // [FIX Bug #15]
        private String studentAnswer;
    }
}