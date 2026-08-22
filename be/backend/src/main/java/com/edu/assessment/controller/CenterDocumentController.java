package com.edu.assessment.controller;

import com.edu.assessment.service.CenterDocumentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/center-manager/documents")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CENTER_MANAGER')")
public class CenterDocumentController {

    private final CenterDocumentService centerDocumentService;

    private Long getCurrentUserId(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("USER_ID") == null) {
            throw new IllegalStateException("Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn!");
        }
        return (Long) session.getAttribute("USER_ID");
    }

    @GetMapping
    public ResponseEntity<?> getAllSharedDocuments() {
        return ResponseEntity.ok(centerDocumentService.getAllSharedDocuments());
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadSharedDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("name") String name,
            @RequestParam(value = "departmentId", required = false) Long departmentId,
            HttpServletRequest request) throws Exception {
        Long uploaderId = getCurrentUserId(request);
        return ResponseEntity.ok(centerDocumentService.uploadSharedDocument(file, name, departmentId, uploaderId));
    }

    @DeleteMapping("/{documentId}")
    public ResponseEntity<?> deleteSharedDocument(
            @PathVariable Long documentId,
            HttpServletRequest request) {
        Long uploaderId = getCurrentUserId(request);
        return ResponseEntity.ok(centerDocumentService.deleteSharedDocument(documentId, uploaderId));
    }
}
