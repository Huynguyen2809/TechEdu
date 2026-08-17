package com.edu.assessment.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "^(0[3|5|7|8|9])[0-9]{8}$",
             message = "Số điện thoại không hợp lệ (phải là số VN 10 chữ số, bắt đầu bằng 03/05/07/08/09)") // [FIX Bug #4]
    private String phoneNumber;
    @NotBlank(message = "Mật khẩu không được để trống")
    private String password;
    @NotBlank(message = "Họ tên không được để trống")
    private String fullName;
}