package com.edu.assessment.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateClassRequest {
    @NotBlank(message = "Tên lớp không được để trống")
    private String name;

    @NotBlank(message = "Tên môn học không được để trống")
    private String subjectName;

    @NotNull(message = "Khối lớp không được để trống")
    @Min(value = 10, message = "Khối lớp nhỏ nhất là 10")
    @Max(value = 12, message = "Khối lớp lớn nhất là 12")
    private Integer gradeLevel;

    private Long assignedTeacherId;
}