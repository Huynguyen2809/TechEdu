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

    public Map<String, Object> login(LoginRequest request, HttpServletRequest httpServletRequest, jakarta.servlet.http.HttpServletResponse httpServletResponse) {
        User user = userRepository.findByPhoneNumber(request.getPhoneNumber())
                .orElseThrow(() -> new IllegalArgumentException("Số điện thoại hoặc mật khẩu không chính xác!"));

        if (!user.getIsActive()) {
            throw new IllegalStateException("Tài khoản của bạn đã bị Quản trị viên khóa!");
        }

        // 1. Kiểm tra tài khoản có đang trong thời gian bị khóa do nhập sai nhiều lần hay không
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        if (user.getLockTime() != null) {
            if (user.getLockTime().isAfter(now)) {
                long minutesRemaining = java.time.Duration.between(now, user.getLockTime()).toMinutes() + 1;
                throw new IllegalStateException("Tài khoản đã bị tạm khóa do nhập sai mật khẩu quá 5 lần. Vui lòng thử lại sau " + minutesRemaining + " phút!");
            } else {
                // Đã hết thời gian khóa -> Tự động reset
                user.setLockTime(null);
                user.setFailedLoginAttempts(0);
                userRepository.save(user);
            }
        }

        // 2. Kiểm tra mật khẩu
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            int currentAttempts = (user.getFailedLoginAttempts() == null ? 0 : user.getFailedLoginAttempts()) + 1;
            user.setFailedLoginAttempts(currentAttempts);

            if (currentAttempts >= 5) {
                user.setLockTime(now.plusMinutes(15));
                userRepository.save(user);
                throw new IllegalStateException("Bạn đã nhập sai mật khẩu 5 lần liên tiếp! Tài khoản đã bị tạm khóa 15 phút để bảo vệ an toàn.");
            } else {
                userRepository.save(user);
                int remaining = 5 - currentAttempts;
                throw new IllegalArgumentException("Số điện thoại hoặc mật khẩu không chính xác! (Còn " + remaining + " lần thử trước khi bị khóa 15 phút)");
            }
        }

        // 3. Đăng nhập thành công -> Reset bộ đếm vi phạm
        if ((user.getFailedLoginAttempts() != null && user.getFailedLoginAttempts() > 0) || user.getLockTime() != null) {
            user.setFailedLoginAttempts(0);
            user.setLockTime(null);
            userRepository.save(user);
        }

        // Bước 1: Hủy session cũ để tránh Session Fixation attack
        HttpSession oldSession = httpServletRequest.getSession(false);
        if (oldSession != null) {
            oldSession.invalidate();
        }

        // Bước 2: Tạo session HOÀN TOÀN MỚI
        HttpSession newSession = httpServletRequest.getSession(true);

        // Bước 3: Tạo SecurityContext với đúng role của user
        List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                user.getPhoneNumber(), null, authorities
        );
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);

        // Bước 4: Lưu SecurityContext vào session mới bằng key chuẩn của Spring Security
        newSession.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context);
        newSession.setAttribute("USER_ID", user.getId());
        newSession.setAttribute("USER_ROLE", user.getRole().name());

        return Map.of(
                "message", "Đăng nhập thành công!",
                "userId", user.getId(),
                "fullName", user.getFullName(),
                "role", user.getRole(),
                "isFirstLogin", user.getIsFirstLogin()
        );
    }

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

    @org.springframework.transaction.annotation.Transactional
    public void changePassword(com.edu.assessment.dto.request.ChangePasswordRequest request) {
        String phoneNumber = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByPhoneNumber(phoneNumber)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tài khoản người dùng!"));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Mật khẩu hiện tại không chính xác!");
        }

        if (request.getNewPassword().equals(request.getOldPassword())) {
            throw new IllegalArgumentException("Mật khẩu mới không được trùng với mật khẩu hiện tại!");
        }

        if (request.getNewPassword().length() < 6) {
            throw new IllegalArgumentException("Mật khẩu mới phải có ít nhất 6 ký tự!");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}