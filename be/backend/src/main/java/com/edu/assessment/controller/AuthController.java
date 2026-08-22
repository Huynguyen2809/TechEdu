package com.edu.assessment.controller;

import com.edu.assessment.dto.request.LoginRequest;
import com.edu.assessment.dto.request.RegisterRequest;
import com.edu.assessment.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService; // <-- Gọi AuthService thay vì gọi trực tiếp Repository

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpServletRequest, jakarta.servlet.http.HttpServletResponse httpServletResponse) {
        return ResponseEntity.ok(authService.login(request, httpServletRequest, httpServletResponse));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        if (request.getSession(false) != null) {
            request.getSession().invalidate(); // Hủy Session khi đăng xuất
        }
        return ResponseEntity.ok(Map.of("message", "Đã đăng xuất khỏi hệ thống!"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        return ResponseEntity.ok(authService.getCurrentUser());
    }

    @PostMapping("/change-password-first-login")
    public ResponseEntity<?> changePasswordFirstLogin(@RequestBody Map<String, String> request) {
        String newPassword = request.get("newPassword");
        if (newPassword == null || newPassword.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Mật khẩu không được để trống!"));
        }
        authService.changePasswordFirstLogin(newPassword);
        return ResponseEntity.ok(Map.of("message", "Đổi mật khẩu thành công!"));
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody com.edu.assessment.dto.request.ChangePasswordRequest request) {
        authService.changePassword(request);
        return ResponseEntity.ok(Map.of("message", "Đổi mật khẩu thành công!"));
    }
}