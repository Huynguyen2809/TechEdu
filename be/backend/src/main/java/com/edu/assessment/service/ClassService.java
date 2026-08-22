package com.edu.assessment.service;

import com.edu.assessment.dto.request.CreateClassRequest;
import com.edu.assessment.dto.request.JoinClassRequest;
import com.edu.assessment.entity.Class;
import com.edu.assessment.entity.ClassMember;
import com.edu.assessment.entity.ExamSubmission;
import com.edu.assessment.entity.User;
import com.edu.assessment.repository.ClassMemberRepository;
import com.edu.assessment.repository.ClassRepository;
import com.edu.assessment.repository.ExamSubmissionRepository;
import com.edu.assessment.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.edu.assessment.dto.request.ClassUpdateRequest;

import java.util.*;

@Service
@RequiredArgsConstructor
public class ClassService {

    private final ClassRepository classRepository;
    private final ClassMemberRepository classMemberRepository;
    private final UserRepository userRepository;
    private final ExamSubmissionRepository examSubmissionRepository;

    // Thuật toán tự sinh mã Join Code gồm 6 ký tự viết hoa (chữ + số) không trùng lặp
    private String generateUniqueJoinCode() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        Random rnd = new Random();
        String code;
        do {
            StringBuilder sb = new StringBuilder(6);
            for (int i = 0; i < 6; i++) {
                sb.append(chars.charAt(rnd.nextInt(chars.length())));
            }
            code = sb.toString();
        } while (classRepository.existsByJoinCode(code)); // Nếu trùng thì tạo lại
        return code;
    }

    // Nghiệp vụ 1: Trưởng bộ môn hoặc Giáo viên tạo lớp mới
    @Transactional
    public Map<String, Object> createClass(CreateClassRequest request, Long creatorId) {
        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thông tin người tạo"));

        if (creator.getRole() != User.Role.TEACHER && creator.getRole() != User.Role.DEPARTMENT_HEAD) {
            throw new IllegalStateException("Chỉ Giáo viên hoặc Trưởng bộ môn mới có quyền tạo lớp học!");
        }

        User assignedTeacher = creator;
        if (creator.getRole() == User.Role.DEPARTMENT_HEAD && request.getAssignedTeacherId() != null) {
            assignedTeacher = userRepository.findById(request.getAssignedTeacherId())
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thông tin Giáo viên được phân công"));
            
            // Tùy chọn: Đảm bảo giáo viên phân công thuộc cùng bộ môn (Nếu DB có setup)
            if (assignedTeacher.getDepartment() == null || creator.getDepartment() == null 
                || !assignedTeacher.getDepartment().getId().equals(creator.getDepartment().getId())) {
                throw new IllegalArgumentException("Giáo viên được phân công không thuộc bộ môn của bạn!");
            }
        }

        Class newClass = Class.builder()
                .name(request.getName())
                .subjectName(request.getSubjectName())
                .gradeLevel(request.getGradeLevel())
                .teacher(assignedTeacher)
                .joinCode(generateUniqueJoinCode())
                .isArchived(false)
                .build();

        classRepository.save(newClass);

        return Map.of(
                "message", "Tạo lớp học thành công!",
                "classId", newClass.getId(),
                "joinCode", newClass.getJoinCode(),
                "name", newClass.getName()
        );
    }

    // Nghiệp vụ 2: Học sinh nhập mã gia nhập lớp
    @Transactional
    public Map<String, Object> joinClass(JoinClassRequest request, Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thông tin Học sinh"));

        if (student.getRole() != User.Role.STUDENT) {
            throw new IllegalStateException("Chỉ Học sinh mới được tham gia vào lớp bằng mã!");
        }

        Class targetClass = classRepository.findByJoinCode(request.getJoinCode().toUpperCase())
                .orElseThrow(() -> new IllegalArgumentException("Mã lớp không tồn tại hoặc đã bị đóng!"));

        if (targetClass.getIsArchived()) {
            throw new IllegalStateException("Lớp học này đã kết thúc và không nhận thêm học sinh.");
        }

        // Kiểm tra xem học sinh đã có trong lớp chưa
        Optional<ClassMember> existingMember = classMemberRepository.findByClazzIdAndStudentId(targetClass.getId(), studentId);
        if (existingMember.isPresent()) {
            ClassMember.Status currentStatus = existingMember.get().getStatus();
            if (currentStatus == ClassMember.Status.ACTIVE) {
                throw new IllegalArgumentException("Bạn đã tham gia lớp học này rồi!");
            } else if (currentStatus == ClassMember.Status.PENDING) {
                throw new IllegalArgumentException("Yêu cầu của bạn đang chờ giáo viên phê duyệt!");
            } else {
                // Nếu trước đó bị xóa, cho phép gia nhập lại bằng cách đổi trạng thái thành PENDING
                existingMember.get().setStatus(ClassMember.Status.PENDING);
                classMemberRepository.save(existingMember.get());
                return Map.of("message", "Đã gửi lại yêu cầu tham gia, vui lòng chờ giáo viên phê duyệt!");
            }
        }

        ClassMember member = ClassMember.builder()
                .clazz(targetClass)
                .student(student)
                .status(ClassMember.Status.PENDING)
                .build();

        classMemberRepository.save(member);

        return Map.of(
                "message", "Đã gửi yêu cầu tham gia, vui lòng chờ giáo viên phê duyệt!",
                "className", targetClass.getName(),
                "teacherName", targetClass.getTeacher().getFullName()
        );
    }

    // Nghiệp vụ 3: Lấy danh sách lớp học của tôi
    public List<Map<String, Object>> getMyClasses(Long userId, String role) {
        if ("TEACHER".equals(role) || "DEPARTMENT_HEAD".equals(role)) {
            List<Class> classes = classRepository.findAllByTeacherIdAndIsArchivedFalse(userId);
            return classes.stream().map(c -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", c.getId());
                map.put("name", c.getName());
                map.put("subjectName", c.getSubjectName());
                map.put("gradeLevel", c.getGradeLevel());
                map.put("joinCode", c.getJoinCode());
                long count = classMemberRepository.countByClazzIdAndStatus(c.getId(), ClassMember.Status.ACTIVE);
                map.put("studentCount", count);
                return map;
            }).toList();
        } else if ("STUDENT".equals(role)) {
            List<ClassMember> members = classMemberRepository.findAllByStudentIdAndStatusWithClassAndTeacher(userId, ClassMember.Status.ACTIVE);
            return members.stream().map(m -> {
                Class c = m.getClazz();
                Map<String, Object> map = new HashMap<>();
                map.put("id", c.getId());
                map.put("name", c.getName());
                map.put("subjectName", c.getSubjectName());
                map.put("gradeLevel", c.getGradeLevel());
                map.put("teacherName", c.getTeacher().getFullName());
                return map;
            }).toList();
        }
        return Collections.emptyList();
    }

    // Nghiệp vụ 4: Lấy thông tin chi tiết của 1 lớp học
    public Map<String, Object> getClassDetails(Long classId, Long userId, String role) {
        Class targetClass = classRepository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException("Lớp học không tồn tại trên hệ thống!"));

        if ("TEACHER".equals(role) || "DEPARTMENT_HEAD".equals(role)) {
            if (!targetClass.getTeacher().getId().equals(userId)) {
                throw new IllegalStateException("Bạn không phải giáo viên phụ trách lớp học này!");
            }
        } else if ("STUDENT".equals(role)) {
            ClassMember member = classMemberRepository.findByClazzIdAndStudentId(classId, userId)
                    .orElseThrow(() -> new IllegalStateException("Bạn chưa gia nhập lớp học này!"));
            if (member.getStatus() != ClassMember.Status.ACTIVE) {
                throw new IllegalStateException("Tài khoản của bạn không còn hoạt động trong lớp học này!");
            }
        }

        Map<String, Object> map = new HashMap<>();
        map.put("id", targetClass.getId());
        map.put("name", targetClass.getName());
        map.put("subjectName", targetClass.getSubjectName());
        map.put("gradeLevel", targetClass.getGradeLevel());
        map.put("teacherName", targetClass.getTeacher() != null ? targetClass.getTeacher().getFullName() : "Giáo viên bộ môn");
        map.put("joinCode", targetClass.getJoinCode());
        map.put("createdAt", targetClass.getCreatedAt() != null ? targetClass.getCreatedAt().toString() : "");
        return map;
    }


    // Nghiệp vụ 5: Lấy danh sách học sinh đang tham gia lớp (Status = ACTIVE) kèm điểm gần nhất
    public List<Map<String, Object>> getClassMembers(Long classId, Long teacherId, String role) {
        Class targetClass = classRepository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException("Lớp học không tồn tại!"));

        if ("TEACHER".equals(role) || "DEPARTMENT_HEAD".equals(role)) {
            if (!targetClass.getTeacher().getId().equals(teacherId)) {
                throw new IllegalStateException("Bạn không có quyền xem danh sách học sinh của lớp này!");
            }
        }

        List<ClassMember> members = classMemberRepository.findAllByClazzIdAndStatusWithStudent(classId, ClassMember.Status.ACTIVE);

        // Tải toàn bộ submission của lớp 1 lần duy nhất (tránh N+1 query)
        List<ExamSubmission> allSubmissions = examSubmissionRepository.findAllByClassIdOrderByStudentAndDate(classId);

        // Tạo Map: studentId -> điểm gần nhất (submission đầu tiên trong list đã sort theo date DESC)
        java.util.Map<Long, Double> latestScoreMap = new java.util.HashMap<>();
        for (ExamSubmission sub : allSubmissions) {
            Long studentId = sub.getStudent().getId();
            if (!latestScoreMap.containsKey(studentId)) {
                latestScoreMap.put(studentId, sub.getTotalScore());
            }
        }

        return members.stream().map(m -> {
            User student = m.getStudent();
            Map<String, Object> map = new HashMap<>();
            map.put("id", m.getId()); // ID của bảng trung gian
            map.put("studentId", student.getId()); // ID của học sinh
            map.put("fullName", student.getFullName());
            map.put("phoneNumber", student.getPhoneNumber());
            map.put("joinedAt", m.getJoinedAt() != null ? m.getJoinedAt().toString() : "");
            // Điểm gần nhất (null nếu chưa nộp bài nào)
            map.put("latestScore", latestScoreMap.getOrDefault(student.getId(), null));
            return map;
        }).toList();
    }

    // Nghiệp vụ 6: Xóa (mời) học sinh ra khỏi lớp
    @Transactional
    public Map<String, Object> removeMember(Long classId, Long studentId, Long teacherId, String role) {
        Class targetClass = classRepository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException("Lớp học không tồn tại!"));

        if ("TEACHER".equals(role)) {
            if (!targetClass.getTeacher().getId().equals(teacherId)) {
                throw new IllegalStateException("Bạn không có quyền xóa học sinh khỏi lớp này!");
            }
        }

        ClassMember member = classMemberRepository.findByClazzIdAndStudentId(classId, studentId)
                .orElseThrow(() -> new IllegalArgumentException("Học sinh này không nằm trong lớp học!"));

        // Đổi trạng thái thành INACTIVE hoặc xóa bản ghi
        member.setStatus(ClassMember.Status.REMOVED);
        classMemberRepository.save(member);

        return Map.of("message", "Đã xóa học sinh ra khỏi lớp học!");
    }

    @Transactional
    public Class updateClass(Long id, ClassUpdateRequest request, Long teacherId, String role) {
        // 1. Tìm lớp học theo ID
        Class targetClass = classRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy lớp học với ID: " + id));

        // Kiểm tra bảo mật: Chỉ giáo viên tạo lớp mới có quyền sửa tên lớp
        if ("TEACHER".equals(role)) {
            if (!targetClass.getTeacher().getId().equals(teacherId)) {
                throw new IllegalStateException("Bạn không có quyền chỉnh sửa lớp học này!");
            }
        }

        // 2. Cập nhật các thông tin mới
        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            targetClass.setName(request.getName().trim());
        }
        if (request.getSubjectName() != null && !request.getSubjectName().trim().isEmpty()) {
            targetClass.setSubjectName(request.getSubjectName().trim());
        }

        // KIỂM TRA INTEGER (KHÔNG DÙNG .trim())
        if (request.getGradeLevel() != null) {
            targetClass.setGradeLevel(request.getGradeLevel());
        }

        // 3. Lưu lại vào Database
        return classRepository.save(targetClass);
    }

    @Transactional
    public Map<String, Object> archiveClass(Long classId, Long teacherId, String role) {
        Class targetClass = classRepository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException("Lớp học không tồn tại trên hệ thống!"));

        // Kiểm tra bảo mật: Chỉ giáo viên tạo lớp mới có quyền xóa
        if ("TEACHER".equals(role)) {
            if (!targetClass.getTeacher().getId().equals(teacherId)) {
                throw new IllegalStateException("Bạn không có quyền xóa lớp học này!");
            }
        }

        // Bật cờ lưu trữ (Soft Delete)
        targetClass.setIsArchived(true);
        classRepository.save(targetClass);

        return Map.of("message", "Đã xóa lớp học thành công!");
    }

    // Nghiệp vụ 8: Xem danh sách chờ duyệt
    public List<Map<String, Object>> getPendingMembers(Long classId, Long teacherId, String role) {
        Class targetClass = classRepository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException("Lớp học không tồn tại!"));

        if ("TEACHER".equals(role)) {
            if (!targetClass.getTeacher().getId().equals(teacherId)) {
                throw new IllegalStateException("Bạn không có quyền xem danh sách chờ của lớp này!");
            }
        }

        List<ClassMember> members = classMemberRepository.findAllByClazzIdAndStatusWithStudent(classId, ClassMember.Status.PENDING);

        return members.stream().map(m -> {
            User student = m.getStudent();
            Map<String, Object> map = new HashMap<>();
            map.put("id", m.getId());
            map.put("studentId", student.getId());
            map.put("fullName", student.getFullName());
            map.put("phoneNumber", student.getPhoneNumber());
            map.put("requestedAt", m.getJoinedAt() != null ? m.getJoinedAt().toString() : "");
            return map;
        }).toList();
    }

    // Nghiệp vụ 9: Duyệt học sinh
    @Transactional
    public Map<String, Object> approveMember(Long classId, Long studentId, Long teacherId, String role) {
        Class targetClass = classRepository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException("Lớp học không tồn tại!"));

        if ("TEACHER".equals(role)) {
            if (!targetClass.getTeacher().getId().equals(teacherId)) {
                throw new IllegalStateException("Bạn không có quyền duyệt học sinh lớp này!");
            }
        }

        ClassMember member = classMemberRepository.findByClazzIdAndStudentId(classId, studentId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy yêu cầu tham gia!"));

        if (member.getStatus() != ClassMember.Status.PENDING) {
            throw new IllegalStateException("Yêu cầu này không ở trạng thái chờ duyệt!");
        }

        member.setStatus(ClassMember.Status.ACTIVE);
        classMemberRepository.save(member);

        return Map.of("message", "Đã duyệt học sinh vào lớp!");
    }

    // Nghiệp vụ 10: Từ chối học sinh
    @Transactional
    public Map<String, Object> rejectMember(Long classId, Long studentId, Long teacherId, String role) {
        Class targetClass = classRepository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException("Lớp học không tồn tại!"));

        if ("TEACHER".equals(role)) {
            if (!targetClass.getTeacher().getId().equals(teacherId)) {
                throw new IllegalStateException("Bạn không có quyền từ chối học sinh lớp này!");
            }
        }

        ClassMember member = classMemberRepository.findByClazzIdAndStudentId(classId, studentId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy yêu cầu tham gia!"));

        if (member.getStatus() != ClassMember.Status.PENDING) {
            throw new IllegalStateException("Yêu cầu này không ở trạng thái chờ duyệt!");
        }

        classMemberRepository.delete(member); // Từ chối thì xóa luôn bản ghi cho nhẹ Database

        return Map.of("message", "Đã từ chối yêu cầu tham gia!");
    }

    public List<Map<String, Object>> getDepartmentTeachers(Long creatorId) {
        User creator = userRepository.findById(creatorId).orElseThrow();
        if (creator.getRole() != User.Role.DEPARTMENT_HEAD) {
            return List.of(Map.of("id", creator.getId(), "fullName", "Bản thân (" + creator.getFullName() + ")"));
        }

        List<User> teachers = userRepository.findAllByRoleOrderByCreatedAtDesc(User.Role.TEACHER);
        List<Map<String, Object>> result = new ArrayList<>();
        result.add(Map.of("id", creator.getId(), "fullName", "Bản thân (" + creator.getFullName() + ")"));
        
        for (User t : teachers) {
            if (t.getDepartment() != null && creator.getDepartment() != null 
                && t.getDepartment().getId().equals(creator.getDepartment().getId())) {
                result.add(Map.of("id", t.getId(), "fullName", t.getFullName()));
            }
        }
        return result;
    }
}