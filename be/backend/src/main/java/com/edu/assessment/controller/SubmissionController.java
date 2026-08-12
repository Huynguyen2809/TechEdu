package com.edu.assessment.controller;

import com.edu.assessment.service.SubmissionService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * SubmissionController — Phân hệ xem lịch sử làm bài dành cho Học sinh.
 * Tách riêng khỏi GradebookController (dành cho Giáo viên) để rõ ràng phân quyền.
 */
@RestController
@RequestMapping("/api/v1/submissions")
@RequiredArgsConstructor
public class SubmissionController {

    private final SubmissionService submissionService;

    private Long getCurrentUserId(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("USER_ID") == null) {
            throw new IllegalStateException("Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn!");
        }
        return (Long) session.getAttribute("USER_ID");
    }

    /**
     * GET /api/v1/submissions/my-history
     * Học sinh xem danh sách tất cả bài thi đã nộp của chính mình.
     * Trả về: examTitle, className, totalScore, submittedAt, timeSpentSeconds.
     */
    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/my-history")
    public ResponseEntity<?> getMyHistory(HttpServletRequest httpServletRequest) {
        Long studentId = getCurrentUserId(httpServletRequest);
        return ResponseEntity.ok(submissionService.getMyHistory(studentId));
    }

    /**
     * GET /api/v1/submissions/{submissionId}/detail
     * Học sinh xem chi tiết bài làm của chính mình: câu hỏi, đáp án học sinh chọn,
     * đáp án đúng và điểm từng câu.
     * Bảo mật: Chỉ đúng chủ nhân bài nộp mới được xem.
     */
    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/{submissionId}/detail")
    public ResponseEntity<?> getMySubmissionDetail(
            @PathVariable Long submissionId,
            HttpServletRequest httpServletRequest) {
        Long studentId = getCurrentUserId(httpServletRequest);
        return ResponseEntity.ok(submissionService.getMySubmissionDetail(submissionId, studentId));
    }
}
