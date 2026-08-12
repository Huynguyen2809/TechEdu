package com.edu.assessment.service;

import com.edu.assessment.dto.request.StaffCreateRequest;
import com.edu.assessment.dto.request.StaffUpdateRequest;
import com.edu.assessment.dto.response.UserResponse;
import com.edu.assessment.entity.User;
import com.edu.assessment.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.edu.assessment.repository.DepartmentRepository;
import com.edu.assessment.entity.Department;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StaffManagementService {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;

    public List<UserResponse> getAllStaff() {
        return userRepository.findAllNonCenterManagerUsersOrderByRole().stream()
                .filter(u -> u.getRole() == User.Role.DEPARTMENT_HEAD || u.getRole() == User.Role.TEACHER)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserResponse createStaff(StaffCreateRequest request) {
        if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new IllegalArgumentException("Số điện thoại này đã được cấp phát tài khoản trong hệ thống!");
        }

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy Tổ chuyên môn"));

        User user = User.builder()
                .fullName(request.getFullName())
                .phoneNumber(request.getPhoneNumber())
                .role(User.Role.TEACHER)
                .passwordHash(passwordEncoder.encode("123456"))
                .isActive(true)
                .isFirstLogin(true)
                .department(department)
                .build();

        user = userRepository.save(user);
        return mapToResponse(user);
    }

    @Transactional
    public UserResponse updateStaff(Long id, StaffUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy nhân sự"));

        if (user.getRole() == User.Role.CENTER_MANAGER) {
            throw new IllegalArgumentException("Không thể thao tác lên tài khoản Quản trị cấp cao!");
        }

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy Tổ chuyên môn"));

        if (user.getRole() == User.Role.DEPARTMENT_HEAD) {
            if (user.getDepartment() != null && !user.getDepartment().getId().equals(department.getId())) {
                throw new IllegalArgumentException("Không thể chuyển bộ môn cho giáo viên đang làm Tổ trưởng. Vui lòng miễn nhiệm Tổ trưởng trước!");
            }
        }

        user.setFullName(request.getFullName());
        user.setDepartment(department);

        user = userRepository.save(user);
        return mapToResponse(user);
    }

    @Transactional
    public void toggleStaffStatus(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy nhân sự"));

        if (user.getRole() == User.Role.CENTER_MANAGER) {
            throw new IllegalArgumentException("Không thể thao tác lên tài khoản Quản trị cấp cao!");
        }

        if (user.getIsActive() && departmentRepository.existsByHeadId(id)) {
            throw new IllegalArgumentException("Không thể khóa tài khoản của Tổ trưởng. Vui lòng thay đổi Tổ trưởng trước!");
        }

        user.setIsActive(!user.getIsActive());
        userRepository.save(user);
    }

    @Transactional
    public void resetStaffPassword(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy nhân sự"));

        if (user.getRole() == User.Role.CENTER_MANAGER) {
            throw new IllegalArgumentException("Không thể thao tác lên tài khoản Quản trị cấp cao!");
        }

        user.setPasswordHash(passwordEncoder.encode("123456"));
        user.setIsFirstLogin(true);
        userRepository.save(user);
    }

    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .departmentId(user.getDepartment() != null ? user.getDepartment().getId() : null)
                .departmentName(user.getDepartment() != null ? user.getDepartment().getName() : "Chưa phân công")
                .build();
    }
}
