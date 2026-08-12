package com.edu.assessment.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateFolderRequest {
    @NotBlank(message = "Tên thư mục không được để trống")
    private String name;

    // Nếu tạo thư mục con thì truyền parentId, nếu tạo ở Root thì không truyền (để null)
    private Long parentId;
}