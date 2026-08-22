package com.edu.assessment.config;

import com.edu.assessment.entity.Department;
import com.edu.assessment.entity.Subject;
import com.edu.assessment.entity.User;
import com.edu.assessment.repository.DepartmentRepository;
import com.edu.assessment.repository.SubjectRepository;
import com.edu.assessment.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
@Order(2)
public class DatabaseSeeder implements CommandLineRunner {

    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;
    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        log.info("═════════════════════════════════════════════════════════════");
        log.info("  BẮT ĐẦU CÀI ĐẶT LẠI HỆ THỐNG MỚI (CLEAN SYSTEM RESET)");
        log.info("═════════════════════════════════════════════════════════════");

        // Hệ thống đã được làm sạch hoàn toàn.
        // Chỉ tự động khởi tạo khi bảng rỗng (đảm bảo không mất dữ liệu của người dùng sau này).

        // 1. Lấy thông tin Quản Lý Trung Tâm
        User centerManager = userRepository.findByPhoneNumber("0999999999").orElse(null);

        // 2. Khởi tạo 3 Tổ chuyên môn mặc định (Toán, Lý, Hóa)
        if (departmentRepository.count() == 0 && centerManager != null) {
            log.info("--- KHỞI TẠO 3 TỔ CHUYÊN MÔN MẶC ĐỊNH ---");
            List<String> defaultDepartments = List.of(
                    "Tổ Toán học",
                    "Tổ Vật lý",
                    "Tổ Hóa học"
            );

            for (String name : defaultDepartments) {
                Department department = Department.builder()
                        .name(name)
                        .head(null)
                        .center(centerManager)
                        .build();
                departmentRepository.save(department);
            }
            log.info(">>> Đã tạo 3 Tổ chuyên môn mặc định: Tổ Toán học, Tổ Vật lý, Tổ Hóa học.");
        }

        // 3. Khởi tạo Danh mục Môn học cho 3 khối (10, 11, 12)
        if (subjectRepository.count() == 0) {
            log.info("--- KHỞI TẠO DANH MỤC MÔN HỌC MẶC ĐỊNH (TOÁN, LÝ, HÓA) ---");
            List<Subject> defaultSubjects = new ArrayList<>();

            for (int grade : List.of(10, 11, 12)) {
                defaultSubjects.add(Subject.builder()
                        .name("Toán học")
                        .gradeLevel(grade)
                        .code("MATH_" + grade)
                        .icon("Calculator")
                        .color("indigo")
                        .description("Toán học Khối " + grade)
                        .build());
                defaultSubjects.add(Subject.builder()
                        .name("Vật lý")
                        .gradeLevel(grade)
                        .code("PHYS_" + grade)
                        .icon("Atom")
                        .color("violet")
                        .description("Vật lý Khối " + grade)
                        .build());
                defaultSubjects.add(Subject.builder()
                        .name("Hóa học")
                        .gradeLevel(grade)
                        .code("CHEM_" + grade)
                        .icon("Beaker")
                        .color("amber")
                        .description("Hóa học Khối " + grade)
                        .build());
            }

            subjectRepository.saveAll(defaultSubjects);
            log.info(">>> Đã tạo 9 Môn học mặc định cho các khối 10, 11, 12.");
        }

        log.info("═════════════════════════════════════════════════════════════");
        log.info("  HỆ THỐNG ĐÃ SẴN SÀNG NHƯ MỚI - DUY NHẤT 1 TÀI KHOẢN QUẢN LÝ");
        log.info("  SĐT: 0999999999 | Mật khẩu: 123456");
        log.info("═════════════════════════════════════════════════════════════");
    }
}
