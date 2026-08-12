package com.edu.assessment.controller;

import com.edu.assessment.service.GradebookService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/gradebook")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('TEACHER', 'CENTER_MANAGER', 'DEPARTMENT_HEAD')") // <-- Bảo mật: Chỉ Giáo viên/Center Manager mới được xem điểm & xuất báo cáo
public class GradebookController {

    private final GradebookService gradebookService;

    private Long getCurrentUserId(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("USER_ID") == null) {
            throw new IllegalStateException("Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn!");
        }
        return (Long) session.getAttribute("USER_ID");
    }

    // 1. API Xem bảng điểm tổng quan của 1 Đề thi
    @GetMapping("/exam/{examId}")
    public ResponseEntity<?> getExamGradebook(@PathVariable Long examId, HttpServletRequest httpServletRequest) {
        Long teacherId = getCurrentUserId(httpServletRequest);
        return ResponseEntity.ok(gradebookService.getExamGradebook(examId, teacherId));
    }

    // 2. API Xem chi tiết bài làm của 1 Học sinh (Đối chiếu đáp án Đúng/Sai)
    @GetMapping("/submission/{submissionId}/detail")
    public ResponseEntity<?> getSubmissionDetail(@PathVariable Long submissionId, HttpServletRequest httpServletRequest) {
        Long teacherId = getCurrentUserId(httpServletRequest);
        return ResponseEntity.ok(gradebookService.getSubmissionDetail(submissionId, teacherId));
    }

    // 3. API Tải file Excel Bảng điểm về máy
    @GetMapping("/exam/{examId}/export-excel")
    public ResponseEntity<byte[]> exportExcel(@PathVariable Long examId, HttpServletRequest httpServletRequest) throws IOException {
        Long teacherId = getCurrentUserId(httpServletRequest);
        byte[] excelContent = gradebookService.exportGradebookToExcel(examId, teacherId);

        // Cấu hình Header HTTP để Trình duyệt/Postman hiểu đây là file Excel tải về
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDispositionFormData("attachment", "Bang_Diem_Ky_Thi_" + examId + ".xlsx");

        return new ResponseEntity<>(excelContent, headers, HttpStatus.OK);
    }
}