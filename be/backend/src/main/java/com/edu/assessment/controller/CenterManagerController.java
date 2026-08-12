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
@PreAuthorize("hasRole('CENTER_MANAGER')")
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

}
