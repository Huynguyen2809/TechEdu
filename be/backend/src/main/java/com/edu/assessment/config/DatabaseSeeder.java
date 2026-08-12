package com.edu.assessment.config;

import com.edu.assessment.entity.Department;
import com.edu.assessment.entity.User;
import com.edu.assessment.repository.DepartmentRepository;
import com.edu.assessment.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Random;
import java.util.ArrayList;

@Component
@RequiredArgsConstructor
@Slf4j
@Order(2)
public class DatabaseSeeder implements CommandLineRunner {

    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        try {
            // Fix schema since Hibernate update doesn't remove NOT NULL constraints
            jdbcTemplate.execute("ALTER TABLE departments MODIFY COLUMN head_id bigint NULL;");
        } catch (Exception e) {
            log.warn("Không thể alter table departments: {}", e.getMessage());
        }

        if (departmentRepository.count() == 0) {
            log.info("--- BẮT ĐẦU KHỞI TẠO DỮ LIỆU TỔ CHUYÊN MÔN MẶC ĐỊNH ---");

            User centerManager = userRepository.findByPhoneNumber("0999999999")
                    .orElse(null);

            if (centerManager != null) {
                List<String> defaultDepartments = List.of(
                        "Tổ Toán học",
                        "Tổ Vật lý",
                        "Tổ Hóa học",
                        "Tổ Tiếng Anh"
                );

                for (String name : defaultDepartments) {
                    Department department = Department.builder()
                            .name(name)
                            .head(null)
                            .center(centerManager)
                            .build();
                    departmentRepository.save(department);
                }
                log.info(">>> Đã khởi tạo thành công 4 Tổ chuyên môn mặc định.");
            } else {
                log.warn(">>> Không tìm thấy Center Manager mặc định. Bỏ qua khởi tạo Tổ chuyên môn.");
            }
            log.info("-----------------------------------------------------");
        }

        if (userRepository.countByRole(User.Role.TEACHER) == 0 && userRepository.countByRole(User.Role.DEPARTMENT_HEAD) == 0) {
            log.info("--- BẮT ĐẦU KHỞI TẠO GIÁO VIÊN MẪU ---");
            List<Department> departments = departmentRepository.findAll();
            if (departments.size() >= 4) {
                String[] firstNames = {"Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ", "Võ", "Đặng"};
                String[] middleNames = {"Văn", "Thị", "Hữu", "Minh", "Thanh", "Ngọc", "Hoàng", "Xuân", "Thu", "Đức"};
                String[] lastNames = {"Anh", "Bình", "Cường", "Dung", "Em", "Phong", "Giang", "Hải", "Hương", "Linh"};
                
                Random random = new Random();
                String defaultPassword = passwordEncoder.encode("123456");
                List<User> teachers = new ArrayList<>();
                
                for (int i = 0; i < 15; i++) {
                    String fullName = firstNames[random.nextInt(firstNames.length)] + " " +
                                      middleNames[random.nextInt(middleNames.length)] + " " +
                                      lastNames[random.nextInt(lastNames.length)];
                    String phone = String.format("09%08d", 80000000 + i);
                    
                    Department dept = departments.get(i % 4);
                    
                    User teacher = User.builder()
                            .fullName(fullName)
                            .phoneNumber(phone)
                            .passwordHash(defaultPassword)
                            .role(User.Role.TEACHER)
                            .isActive(true)
                            .isFirstLogin(true)
                            .department(dept)
                            .build();
                    teachers.add(teacher);
                }
                userRepository.saveAll(teachers);
                log.info(">>> Đã tạo 15 Giáo viên mẫu!");
                
                log.info("--- BẮT ĐẦU CHỈ ĐỊNH TỔ TRƯỞNG ---");
                for (Department dept : departments) {
                    User head = teachers.stream()
                                        .filter(t -> t.getDepartment().getId().equals(dept.getId()))
                                        .findFirst()
                                        .orElse(null);
                    if (head != null) {
                        head.setRole(User.Role.DEPARTMENT_HEAD);
                        userRepository.save(head);
                        
                        dept.setHead(head);
                        departmentRepository.save(dept);
                    }
                }
                log.info("Database Seeding: Đã tạo thành công dữ liệu mẫu!");
            }
        }
    }
}
