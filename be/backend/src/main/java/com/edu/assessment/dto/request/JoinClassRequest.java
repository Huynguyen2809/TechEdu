package com.edu.assessment.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class JoinClassRequest {
    @NotBlank(message = "Mã vào lớp không được để trống")
    private String joinCode;
}