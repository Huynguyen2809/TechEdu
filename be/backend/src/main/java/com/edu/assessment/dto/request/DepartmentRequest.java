package com.edu.assessment.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class DepartmentRequest {

    @NotBlank(message = "Tên tổ chuyên môn không được để trống")
    private String name;

    private Long headId;
}
