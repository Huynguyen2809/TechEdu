package com.edu.assessment.controller;

import com.edu.assessment.dto.request.CreateExamRequest;
import com.edu.assessment.service.ExamService;
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
@RequestMapping("/api/v1/exams")
@RequiredArgsConstructor

public class ExamController {

    private final ExamService examService;

    @PreAuthorize("hasAnyRole('TEACHER', 'STUDENT', 'CENTER_MANAGER', 'DEPARTMENT_HEAD')")
    @GetMapping("/class/{classId}")
    public ResponseEntity<?> getExamsForClass(@PathVariable Long classId, HttpServletRequest httpServletRequest) {
        Long userId = getCurrentUserId(httpServletRequest);
        String role = getCurrentUserRole(httpServletRequest);
        return ResponseEntity.ok(examService.getExamsForClass(classId, userId, role));
    }

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
    public ResponseEntity<?> createExam(@Valid @RequestBody CreateExamRequest request, HttpServletRequest httpServletRequest) {
        Long teacherId = getCurrentUserId(httpServletRequest);
        String role = getCurrentUserRole(httpServletRequest);
        return ResponseEntity.ok(examService.createExam(request, teacherId, role));
    }

    // 2. API Học sinh vào phòng thi Split-screen (Lấy PDF & Khung phiếu trả lời)
    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/{examId}/take")
    public ResponseEntity<?> getExamForTaking(@PathVariable Long examId, HttpServletRequest httpServletRequest) {
        Long studentId = getCurrentUserId(httpServletRequest);
        return ResponseEntity.ok(examService.getExamForTaking(examId, studentId));
    }

    // 3. API Học sinh nộp bài và chấm điểm tự động
    @PreAuthorize("hasRole('STUDENT')")
    @PostMapping("/{examId}/submit")
    public ResponseEntity<?> submitExam(
            @PathVariable Long examId,
            @Valid @RequestBody com.edu.assessment.dto.request.SubmitExamRequest request,
            HttpServletRequest httpServletRequest) {
        Long studentId = getCurrentUserId(httpServletRequest);
        return ResponseEntity.ok(examService.submitExam(examId, request, studentId));
    }
}