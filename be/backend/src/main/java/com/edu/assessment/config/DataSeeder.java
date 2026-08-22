package com.edu.assessment.config;

import com.edu.assessment.entity.User;
import com.edu.assessment.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
@Order(1)
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        // Migration fix: Cập nhật role cũ 'ADMIN' thành 'CENTER_MANAGER'
        try {
            jdbcTemplate.update("UPDATE users SET role = 'CENTER_MANAGER' WHERE role = 'ADMIN'");
        } catch (Exception ignored) {}

        String centerManagerPhone = "0999999999";
        String centerManagerPassword = "123456";

        // Khởi tạo hoặc cập nhật chuẩn tài khoản Quản Lý Trung Tâm duy nhất
        User centerManager = userRepository.findByPhoneNumber(centerManagerPhone).orElse(null);
        if (centerManager == null) {
            log.info("--- KHỞI TẠO TÀI KHOẢN QUẢN LÝ TRUNG TÂM DUY NHẤT ---");
            centerManager = User.builder()
                    .phoneNumber(centerManagerPhone)
                    .passwordHash(passwordEncoder.encode(centerManagerPassword))
                    .fullName("Quản Lý Trung Tâm")
                    .role(User.Role.CENTER_MANAGER)
                    .isActive(true)
                    .isFirstLogin(false)
                    .build();
            userRepository.save(centerManager);
            log.info(">>> Khởi tạo thành công Quản Lý Trung Tâm | SĐT: {} | Mật khẩu: {}", centerManagerPhone, centerManagerPassword);
        } else {
            centerManager.setFullName("Quản Lý Trung Tâm");
            centerManager.setRole(User.Role.CENTER_MANAGER);
            centerManager.setIsActive(true);
            centerManager.setLockTime(null);
            centerManager.setFailedLoginAttempts(0);
            userRepository.save(centerManager);
            log.info("--- Đã kiểm tra, mở khóa và bảo toàn tài khoản Quản Lý Trung Tâm: {} ---", centerManagerPhone);
        }
    }
}