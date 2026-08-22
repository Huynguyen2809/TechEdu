package com.edu.assessment.controller;

import com.edu.assessment.service.CenterManagerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * CenterManagerController - Endpoint quan tri vien.
 * Tat ca deu yeu cau role CENTER_MANAGER.
 */
@RestController
@RequestMapping("/api/v1/center-manager")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('CENTER_MANAGER', 'DEPARTMENT_HEAD')")
public class CenterManagerController {

    private final CenterManagerService centerManagerService;

    /**
     * GET /api/v1/center-manager/stats
     * Thong ke tong quan he thong: so GV, HS, lop hoc, bai thi, luot thi.
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getSystemStats() {
        return ResponseEntity.ok(centerManagerService.getDashboardStats());
    }

    @GetMapping("/analytics")
    public ResponseEntity<?> getAnalyticsDashboard(jakarta.servlet.http.HttpServletRequest request) {
        jakarta.servlet.http.HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("USER_ID") == null) {
            throw new IllegalStateException("Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn!");
        }
        Long userId = (Long) session.getAttribute("USER_ID");
        return ResponseEntity.ok(centerManagerService.getAnalyticsDashboard(userId));
    }

}
