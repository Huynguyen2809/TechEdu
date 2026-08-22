package com.edu.assessment.service;

import com.edu.assessment.repository.DepartmentRepository;
import com.edu.assessment.repository.DocumentRepository;
import com.edu.assessment.repository.UserRepository;
import com.edu.assessment.repository.ClassRepository;
import com.edu.assessment.repository.ExamRepository;
import com.edu.assessment.repository.ExamSubmissionRepository;
import com.edu.assessment.dto.response.DashboardStatsResponse;
import com.edu.assessment.entity.Document;
import com.edu.assessment.entity.User;
import com.edu.assessment.entity.Document;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * CenterManagerService — Cac nghiep vu quan tri vien:
 * - Thong ke he thong
 * - Quan ly nguoi dung (xem, khoa/mo)
 */
@Service
@RequiredArgsConstructor
public class CenterManagerService {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final DocumentRepository documentRepository;
    private final ClassRepository classRepository;
    private final ExamRepository examRepository;
    private final ExamSubmissionRepository submissionRepository;
    private final com.edu.assessment.repository.SubjectRepository subjectRepository;

    // ─── Nghiep vu 1: Thong ke tong quan he thong ─────────────────────────
    public DashboardStatsResponse getDashboardStats() {
        long teachers = userRepository.countByRole(User.Role.TEACHER);
        long students = userRepository.countByRole(User.Role.STUDENT);
        long centerManagers = userRepository.countByRole(User.Role.CENTER_MANAGER);
        long departmentHeads = userRepository.countByRole(User.Role.DEPARTMENT_HEAD);
        
        long totalStaff = teachers + departmentHeads;
        long totalDepartments = departmentRepository.count();
        long totalSharedDocuments = documentRepository.countByFileType(Document.FileType.SHARED_MATERIAL);
        
        long totalClasses = classRepository.count();
        long totalExams = examRepository.count();
        long totalSubmissions = submissionRepository.count();

        return DashboardStatsResponse.builder()
                .totalStaff(totalStaff)
                .totalTeachers(teachers)
                .totalStudents(students)
                .totalDepartments(totalDepartments)
                .totalSharedDocuments(totalSharedDocuments)
                .totalClasses(totalClasses)
                .totalExams(totalExams)
                .totalSubmissions(totalSubmissions)
                .build();
    }

    // ─── Nghiep vu 2: Lay danh sach nguoi dung (loc theo Role va tu khoa) ─
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getUsers(String roleFilter, String keyword) {
        List<User> users;

        boolean hasKeyword = keyword != null && !keyword.trim().isEmpty();
        boolean hasRole    = roleFilter != null && !roleFilter.isBlank() && !roleFilter.equalsIgnoreCase("ALL");

        if (hasRole && hasKeyword) {
            try {
                User.Role role = User.Role.valueOf(roleFilter.toUpperCase());
                users = userRepository.searchByRoleAndKeyword(role, keyword.trim());
            } catch (IllegalArgumentException e) {
                users = List.of();
            }
        } else if (hasRole) {
            try {
                User.Role role = User.Role.valueOf(roleFilter.toUpperCase());
                users = userRepository.findAllByRoleOrderByCreatedAtDesc(role);
            } catch (IllegalArgumentException e) {
                users = List.of();
            }
        } else if (hasKeyword) {
            // Tim tat ca (khong phai Center Manager) theo tu khoa
            users = userRepository.findAllNonCenterManagerUsersOrderByRole().stream()
                    .filter(u -> u.getFullName().toLowerCase().contains(keyword.toLowerCase())
                                 || u.getPhoneNumber().contains(keyword))
                    .collect(Collectors.toList());
        } else {
            users = userRepository.findAllNonCenterManagerUsersOrderByRole();
        }

        return users.stream().map(this::mapUser).toList();
    }

    // ─── Nghiep vu 3: Khoa hoac Mo khoa tai khoan ─────────────────────────
    @Transactional
    public Map<String, Object> toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Nguoi dung khong ton tai!"));

        // Khong cho phep Center Manager khoa chinh minh hoac khoa Center Manager khac
        if (user.getRole() == User.Role.CENTER_MANAGER) {
            throw new IllegalStateException("Khong the khoa tai khoan Center Manager!");
        }

        boolean newStatus = !user.getIsActive();
        user.setIsActive(newStatus);
        userRepository.save(user);

        return Map.of(
            "message", newStatus ? "Da mo khoa tai khoan thanh cong!" : "Da khoa tai khoan thanh cong!",
            "userId", userId,
            "isActive", newStatus
        );
    }

    // ─── Helper: Chuyen User entity thanh Map response ────────────────────
    private Map<String, Object> mapUser(User u) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id",          u.getId());
        map.put("fullName",    u.getFullName());
        map.put("phoneNumber", u.getPhoneNumber());
        map.put("role",        u.getRole().name());
        map.put("isActive",    u.getIsActive());
        map.put("createdAt",   u.getCreatedAt() != null ? u.getCreatedAt().toString() : null);
        return map;
    }

    // ─── Nghiep vu 4: Thong ke chuyen sau (Phan tich Pho diem) ────────────────
    public Map<String, Object> getAnalyticsDashboard(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        Long departmentId = (user.getRole() == User.Role.DEPARTMENT_HEAD && user.getDepartment() != null) 
            ? user.getDepartment().getId() : null;

        List<com.edu.assessment.entity.ExamSubmission> allSubmissions = submissionRepository.findAll();
        
        if (departmentId != null) {
            allSubmissions = allSubmissions.stream()
                .filter(sub -> sub.getExam() != null && sub.getExam().getTeacher() != null && sub.getExam().getTeacher().getDepartment() != null 
                            && sub.getExam().getTeacher().getDepartment().getId().equals(departmentId))
                .collect(java.util.stream.Collectors.toList());
        }

        int totalSubmissions = allSubmissions.size();
        int passCount = 0;
        int failCount = 0;
        
        // Phân bổ: 0-2, 2.1-4, 4.1-6, 6.1-8, 8.1-10
        int[] distribution = new int[5];

        for (com.edu.assessment.entity.ExamSubmission sub : allSubmissions) {
            double score = sub.getTotalScore();
            if (score >= 5.0) {
                passCount++;
            } else {
                failCount++;
            }

            if (score <= 2.0) distribution[0]++;
            else if (score <= 4.0) distribution[1]++;
            else if (score <= 6.0) distribution[2]++;
            else if (score <= 8.0) distribution[3]++;
            else distribution[4]++;
        }

        double passRate = totalSubmissions > 0 ? (double) passCount / totalSubmissions * 100 : 0.0;

        return Map.of(
            "totalSubmissions", totalSubmissions,
            "passCount", passCount,
            "failCount", failCount,
            "passRate", Math.round(passRate * 100.0) / 100.0,
            "scoreDistribution", Map.of(
                "0-2", distribution[0],
                "2-4", distribution[1],
                "4-6", distribution[2],
                "6-8", distribution[3],
                "8-10", distribution[4]
            )
        );
    }

    // ─── Nghiep vu 5: Danh muc Khoi & Mon hoc (Category & Subject Management) ─
    @Transactional(readOnly = true)
    public Map<String, Object> getCategories() {
        List<com.edu.assessment.entity.Subject> allSubjects = subjectRepository.findAllByOrderByGradeLevelAscIdAsc();
        
        // Nhóm theo khối lớp (10, 11, 12)
        Map<String, List<com.edu.assessment.entity.Subject>> subjectsByGrade = new LinkedHashMap<>();
        subjectsByGrade.put("10", new ArrayList<>());
        subjectsByGrade.put("11", new ArrayList<>());
        subjectsByGrade.put("12", new ArrayList<>());

        for (com.edu.assessment.entity.Subject subject : allSubjects) {
            String gradeKey = String.valueOf(subject.getGradeLevel());
            subjectsByGrade.computeIfAbsent(gradeKey, k -> new ArrayList<>()).add(subject);
        }

        List<Integer> grades = List.of(10, 11, 12);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("grades", grades);
        result.put("subjectsByGrade", subjectsByGrade);
        result.put("allSubjects", allSubjects);
        return result;
    }

    @Transactional
    public com.edu.assessment.entity.Subject createSubject(Map<String, Object> data) {
        String name = (String) data.get("name");
        Integer gradeLevel = data.get("gradeLevel") != null ? Integer.valueOf(data.get("gradeLevel").toString()) : 12;
        String icon = data.get("icon") != null ? (String) data.get("icon") : "BookOpen";
        String color = data.get("color") != null ? (String) data.get("color") : "indigo";
        String description = (String) data.get("description");

        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Tên môn học không được để trống!");
        }

        if (subjectRepository.existsByNameAndGradeLevel(name.trim(), gradeLevel)) {
            throw new IllegalArgumentException("Môn học '" + name.trim() + "' đã tồn tại trong Khối " + gradeLevel + "!");
        }

        com.edu.assessment.entity.Subject subject = com.edu.assessment.entity.Subject.builder()
                .name(name.trim())
                .gradeLevel(gradeLevel)
                .icon(icon)
                .color(color)
                .description(description)
                .build();

        return subjectRepository.save(subject);
    }

    @Transactional
    public void deleteSubject(Long id) {
        if (!subjectRepository.existsById(id)) {
            throw new IllegalArgumentException("Không tìm thấy môn học với ID: " + id);
        }
        subjectRepository.deleteById(id);
    }
}
