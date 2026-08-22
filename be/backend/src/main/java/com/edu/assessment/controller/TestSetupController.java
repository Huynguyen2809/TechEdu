package com.edu.assessment.controller;

import com.edu.assessment.entity.User;
import com.edu.assessment.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/test-setup")
@RequiredArgsConstructor
public class TestSetupController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/seed")
    public ResponseEntity<String> seedData() {
        if (!userRepository.existsByPhoneNumber("0888888888")) {
            userRepository.save(User.builder()
                    .phoneNumber("0888888888")
                    .passwordHash(passwordEncoder.encode("123456"))
                    .fullName("Tổ trưởng chuyên môn")
                    .role(User.Role.DEPARTMENT_HEAD)
                    .isActive(true)
                    .build());
        }

        if (!userRepository.existsByPhoneNumber("0777777777")) {
            userRepository.save(User.builder()
                    .phoneNumber("0777777777")
                    .passwordHash(passwordEncoder.encode("123456"))
                    .fullName("Giáo viên Demo")
                    .role(User.Role.TEACHER)
                    .isActive(true)
                    .build());
        }

        if (!userRepository.existsByPhoneNumber("0666666666")) {
            userRepository.save(User.builder()
                    .phoneNumber("0666666666")
                    .passwordHash(passwordEncoder.encode("123456"))
                    .fullName("Học sinh Demo")
                    .role(User.Role.STUDENT)
                    .isActive(true)
                    .build());
        }
        
        StringBuilder sb = new StringBuilder();
        for(User u : userRepository.findAll()) {
            sb.append(u.getRole().name()).append(" : ").append(u.getPhoneNumber()).append("\n");
        }
        return ResponseEntity.ok(sb.toString());
    }
}
