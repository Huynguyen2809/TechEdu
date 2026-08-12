package com.edu.assessment.controller;

import com.edu.assessment.dto.request.StaffCreateRequest;
import com.edu.assessment.dto.request.StaffUpdateRequest;
import com.edu.assessment.dto.response.UserResponse;
import com.edu.assessment.service.StaffManagementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/center-manager/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CENTER_MANAGER')")
public class StaffManagementController {

    private final StaffManagementService staffManagementService;

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllStaff() {
        return ResponseEntity.ok(staffManagementService.getAllStaff());
    }

    @PostMapping
    public ResponseEntity<UserResponse> createStaff(@Valid @RequestBody StaffCreateRequest request) {
        return ResponseEntity.ok(staffManagementService.createStaff(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateStaff(
            @PathVariable Long id,
            @Valid @RequestBody StaffUpdateRequest request) {
        return ResponseEntity.ok(staffManagementService.updateStaff(id, request));
    }

    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<Void> toggleStaffStatus(@PathVariable Long id) {
        staffManagementService.toggleStaffStatus(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/reset-password")
    public ResponseEntity<Void> resetStaffPassword(@PathVariable Long id) {
        staffManagementService.resetStaffPassword(id);
        return ResponseEntity.ok().build();
    }
}
