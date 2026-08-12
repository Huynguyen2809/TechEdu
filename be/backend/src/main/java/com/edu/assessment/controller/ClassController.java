package com.edu.assessment.controller;

import com.edu.assessment.dto.request.CreateClassRequest;
import com.edu.assessment.dto.request.JoinClassRequest;
import com.edu.assessment.dto.request.ClassUpdateRequest; // Bổ sung import này
import com.edu.assessment.entity.Class; // Dùng Class thay vì ClassEntity
import com.edu.assessment.service.ClassService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/classes")
@RequiredArgsConstructor
public class ClassController {

    private final ClassService classService;

    // Helper: Lấy userId đang đăng nhập từ Session
    private Long getCurrentUserId(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("USER_ID") == null) {
            throw new IllegalStateException("Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn!");
        }
        return (Long) session.getAttribute("USER_ID");
    }

    private String getCurrentUserRole(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("USER_ROLE") == null) {
            throw new IllegalStateException("Bạn chưa đăng nhập!");
        }
        return (String) session.getAttribute("USER_ROLE");
    }

    @PreAuthorize("hasAnyRole('TEACHER', 'CENTER_MANAGER', 'DEPARTMENT_HEAD')")
    @PostMapping
    public ResponseEntity<?> createClass(@Valid @RequestBody CreateClassRequest request, HttpServletRequest httpServletRequest) {
        Long teacherId = getCurrentUserId(httpServletRequest);
        return ResponseEntity.ok(classService.createClass(request, teacherId));
    }

    @PreAuthorize("hasRole('STUDENT')")
    @PostMapping("/join")
    public ResponseEntity<?> joinClass(@Valid @RequestBody JoinClassRequest request, HttpServletRequest httpServletRequest) {
        Long studentId = getCurrentUserId(httpServletRequest);
        return ResponseEntity.ok(classService.joinClass(request, studentId));
    }

    @GetMapping("/my-classes")
    public ResponseEntity<?> getMyClasses(HttpServletRequest httpServletRequest) {
        Long userId = getCurrentUserId(httpServletRequest);
        String role = getCurrentUserRole(httpServletRequest);
        return ResponseEntity.ok(classService.getMyClasses(userId, role));
    }

    @PreAuthorize("hasAnyRole('TEACHER', 'CENTER_MANAGER', 'DEPARTMENT_HEAD', 'STUDENT')")
    @GetMapping("/{id}")
    public ResponseEntity<?> getClassDetails(@PathVariable Long id, HttpServletRequest httpServletRequest) {
        Long userId = getCurrentUserId(httpServletRequest);
        String role = getCurrentUserRole(httpServletRequest);
        return ResponseEntity.ok(classService.getClassDetails(id, userId, role));
    }


    @PreAuthorize("hasAnyRole('TEACHER', 'CENTER_MANAGER', 'DEPARTMENT_HEAD')")
    @GetMapping("/{id}/members")
    public ResponseEntity<?> getClassMembers(@PathVariable Long id, HttpServletRequest httpServletRequest) {
        Long teacherId = getCurrentUserId(httpServletRequest);
        return ResponseEntity.ok(classService.getClassMembers(id, teacherId));
    }

    @PreAuthorize("hasAnyRole('TEACHER', 'CENTER_MANAGER', 'DEPARTMENT_HEAD')")
    @DeleteMapping("/{classId}/members/{studentId}")
    public ResponseEntity<?> removeMember(@PathVariable Long classId, @PathVariable Long studentId, HttpServletRequest httpServletRequest) {
        Long teacherId = getCurrentUserId(httpServletRequest);
        return ResponseEntity.ok(classService.removeMember(classId, studentId, teacherId));
    }

    // API Cập nhật thông tin lớp học (ĐÃ SỬA LỖI VÀ CHUẨN HÓA)
    @PreAuthorize("hasAnyRole('TEACHER', 'CENTER_MANAGER', 'DEPARTMENT_HEAD')")
    @PutMapping("/{id}")
    public ResponseEntity<?> updateClass(@PathVariable Long id, @RequestBody ClassUpdateRequest request, HttpServletRequest httpServletRequest) {
        Long teacherId = getCurrentUserId(httpServletRequest);
        Class updatedClass = classService.updateClass(id, request, teacherId);
        return ResponseEntity.ok(updatedClass);
    }

    // API xóa / ẩn lớp học
    @PreAuthorize("hasAnyRole('TEACHER', 'CENTER_MANAGER', 'DEPARTMENT_HEAD')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> archiveClass(@PathVariable Long id, HttpServletRequest httpServletRequest) {
        Long teacherId = getCurrentUserId(httpServletRequest);
        return ResponseEntity.ok(classService.archiveClass(id, teacherId));
    }
}