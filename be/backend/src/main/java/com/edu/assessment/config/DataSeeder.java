package com.edu.assessment.config;

import com.edu.assessment.entity.User;
import com.edu.assessment.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j // Lombok annotation để in log ra Console cho đẹp
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        // Migration fix: Cập nhật role cũ 'ADMIN' thành 'CENTER_MANAGER'
        jdbcTemplate.update("UPDATE users SET role = 'CENTER_MANAGER' WHERE role = 'ADMIN'");
        // Số điện thoại và mật khẩu mặc định của Center Manager hệ thống
        String centerManagerPhone = "0999999999";
        String centerManagerPassword = "123456";

        // Kiểm tra xem dưới DB đã có tài khoản Center Manager này chưa
        if (!userRepository.existsByPhoneNumber(centerManagerPhone)) {
            log.info("--- BẮT ĐẦU KHỞI TẠO TÀI KHOẢN CENTER MANAGER MẶC ĐỊNH ---");

            User centerManager = User.builder()
                    .phoneNumber(centerManagerPhone)
                    .passwordHash(passwordEncoder.encode(centerManagerPassword))
                    .fullName("Quản Trị Viên Hệ Thống")
                    .role(User.Role.CENTER_MANAGER)
                    .isActive(true)
                    .build();

            userRepository.save(centerManager);
            log.info(">>> Khởi tạo thành công Center Manager | SĐT: {} | Mật khẩu: {}", centerManagerPhone,
                    centerManagerPassword);
            log.info("-----------------------------------------------------");
        } else {
            log.info("--- Tài khoản Center Manager hệ thống đã tồn tại, bỏ qua bước khởi tạo ---");
        }

        // Seed Department Head
        if (!userRepository.existsByPhoneNumber("0888888888")) {
            userRepository.save(User.builder()
                    .phoneNumber("0888888888")
                    .passwordHash(passwordEncoder.encode("123456"))
                    .fullName("Tổ trưởng chuyên môn")
                    .role(User.Role.DEPARTMENT_HEAD)
                    .isActive(true)
                    .build());
        }

        // Seed Teacher
        if (!userRepository.existsByPhoneNumber("0777777777")) {
            userRepository.save(User.builder()
                    .phoneNumber("0777777777")
                    .passwordHash(passwordEncoder.encode("123456"))
                    .fullName("Giáo viên Demo")
                    .role(User.Role.TEACHER)
                    .isActive(true)
                    .build());
        }

        // Seed Student
        if (!userRepository.existsByPhoneNumber("0666666666")) {
            userRepository.save(User.builder()
                    .phoneNumber("0666666666")
                    .passwordHash(passwordEncoder.encode("123456"))
                    .fullName("Học sinh Demo")
                    .role(User.Role.STUDENT)
                    .isActive(true)
                    .build());
        }
    }
}