package com.edu.assessment.service;

import com.edu.assessment.dto.request.LoginRequest;
import com.edu.assessment.dto.request.RegisterRequest;
import com.edu.assessment.entity.User;
import com.edu.assessment.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public Map<String, Object> register(RegisterRequest request) {
        if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new IllegalArgumentException("Số điện thoại này đã được đăng ký trên hệ thống!");
        }

        // Ép cứng: Mọi tài khoản tạo qua API đăng ký công khai đều bắt buộc là STUDENT (Bỏ qua parameter role từ Frontend)
        User user = User.builder()
                .phoneNumber(request.getPhoneNumber())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(User.Role.STUDENT)
                .isActive(true)
                .isFirstLogin(false)
                .build();

        userRepository.save(user);
        return Map.of("message", "Đăng ký tài khoản thành công!");
    }

    public Map<String, Object> login(LoginRequest request, HttpServletRequest httpServletRequest) {
        User user = userRepository.findByPhoneNumber(request.getPhoneNumber())
                .orElseThrow(() -> new IllegalArgumentException("Số điện thoại hoặc mật khẩu không chính xác!"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Số điện thoại hoặc mật khẩu không chính xác!");
        }

        if (!user.getIsActive()) {
            throw new IllegalStateException("Tài khoản của bạn đã bị Quản trị viên khóa!");
        }
        List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                user.getPhoneNumber(), null, authorities
        );
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        HttpSession session = httpServletRequest.getSession(true);
        session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context);

        // Tạo Session và lưu trữ thông tin User vào bộ nhớ máy chủ
        session.setAttribute("USER_ID", user.getId());
        session.setAttribute("USER_ROLE", user.getRole().name());

        return Map.of(
                "message", "Đăng nhập thành công!",
                "userId", user.getId(),
                "fullName", user.getFullName(),
                "role", user.getRole(),
                "isFirstLogin", user.getIsFirstLogin()
        );
    }

    // BỔ SUNG VÀO CLASS AuthService CỦA BẠN:
    public Map<String, Object> getCurrentUser() {
        // 1. Lấy thông tin xác thực từ bộ nhớ Spring Security Context
        org.springframework.security.core.Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        // 2. Kiểm tra tính hợp lệ của phiên làm việc
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new IllegalArgumentException("Chưa đăng nhập hoặc phiên làm việc đã hết hạn");
        }

        // 3. Trích xuất số điện thoại (được lưu là principal trong token)
        String phoneNumber = authentication.getName();

        // 4. Tra cứu thông tin người dùng từ DB
        User user = userRepository.findByPhoneNumber(phoneNumber)
                .orElseThrow(() -> new IllegalArgumentException("Tài khoản không tồn tại trên hệ thống"));

        // 5. Trả về payload chuẩn cho Frontend React lưu vào AuthContext
        return Map.of(
                "id", user.getId(),
                "phoneNumber", user.getPhoneNumber(),
                "fullName", user.getFullName(),
                "role", user.getRole().name(),
                "isFirstLogin", user.getIsFirstLogin()
        );
    }

    @org.springframework.transaction.annotation.Transactional
    public void changePasswordFirstLogin(String newPassword) {
        String phoneNumber = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByPhoneNumber(phoneNumber)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng"));

        if (!user.getIsFirstLogin()) {
            throw new IllegalStateException("Bạn đã đổi mật khẩu trước đó rồi!");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setIsFirstLogin(false);
        userRepository.save(user);
    }
}