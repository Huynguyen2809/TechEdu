package com.edu.assessment.service;

import com.edu.assessment.dto.request.DepartmentRequest;
import com.edu.assessment.dto.response.DepartmentResponse;
import com.edu.assessment.entity.Department;
import com.edu.assessment.entity.User;
import com.edu.assessment.repository.DepartmentRepository;
import com.edu.assessment.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;

    public List<DepartmentResponse> getAllDepartments() {
        return departmentRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public DepartmentResponse createDepartment(DepartmentRequest request) {
        if (departmentRepository.existsByName(request.getName())) {
            throw new IllegalArgumentException("Tên tổ chuyên môn đã tồn tại!");
        }

        User head = null;
        if (request.getHeadId() != null) {
            head = userRepository.findById(request.getHeadId())
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tổ trưởng!"));

            if (head.getRole() != User.Role.TEACHER && head.getRole() != User.Role.DEPARTMENT_HEAD) {
                throw new IllegalArgumentException("Chỉ Giáo viên mới có thể được chỉ định làm Tổ trưởng!");
            }

            if (departmentRepository.existsByHeadId(head.getId())) {
                throw new IllegalArgumentException("Giáo viên này đang làm Tổ trưởng của một Tổ khác!");
            }

            head.setRole(User.Role.DEPARTMENT_HEAD);
            userRepository.save(head);
        }

        String currentPhoneNumber = SecurityContextHolder.getContext().getAuthentication().getName();
        User center = userRepository.findByPhoneNumber(currentPhoneNumber)
                .orElseThrow(() -> new IllegalArgumentException("Lỗi xác thực người dùng"));

        Department department = Department.builder()
                .name(request.getName())
                .head(head)
                .center(center)
                .build();

        department = departmentRepository.save(department);

        if (head != null) {
            head.setDepartment(department);
            userRepository.save(head);
        }

        return mapToResponse(department);
    }

    @Transactional
    public DepartmentResponse updateDepartment(Long id, DepartmentRequest request) {
        if (departmentRepository.existsByNameAndIdNot(request.getName(), id)) {
            throw new IllegalArgumentException("Tên tổ chuyên môn đã tồn tại ở một tổ khác!");
        }

        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tổ chuyên môn!"));

        Long currentHeadId = department.getHead() != null ? department.getHead().getId() : null;
        Long newHeadId = request.getHeadId();

        if (currentHeadId == null ? newHeadId != null : !currentHeadId.equals(newHeadId)) {
            User oldHead = department.getHead();
            if (oldHead != null && !departmentRepository.existsByHeadIdAndIdNot(oldHead.getId(), id)) {
                oldHead.setRole(User.Role.TEACHER);
                userRepository.save(oldHead);
            }

            if (newHeadId != null) {
                User newHead = userRepository.findById(newHeadId)
                        .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tổ trưởng mới!"));

                if (newHead.getRole() != User.Role.TEACHER && newHead.getRole() != User.Role.DEPARTMENT_HEAD) {
                    throw new IllegalArgumentException("Chỉ Giáo viên mới có thể được chỉ định làm Tổ trưởng!");
                }

                if (departmentRepository.existsByHeadIdAndIdNot(newHead.getId(), id)) {
                    throw new IllegalArgumentException("Giáo viên này đang làm Tổ trưởng của một Tổ khác!");
                }

                newHead.setRole(User.Role.DEPARTMENT_HEAD);
                newHead.setDepartment(department);
                userRepository.save(newHead);
                department.setHead(newHead);
            } else {
                department.setHead(null);
            }
        }

        department.setName(request.getName());

        department = departmentRepository.save(department);
        return mapToResponse(department);
    }

    @Transactional
    public void deleteDepartment(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tổ chuyên môn!"));

        List<User> members = userRepository.findByDepartmentId(id);
        for (User member : members) {
            member.setDepartment(null);
            if (member.getRole() == User.Role.DEPARTMENT_HEAD) {
                member.setRole(User.Role.TEACHER);
            }
            userRepository.save(member);
        }

        departmentRepository.delete(department);
    }

    private DepartmentResponse mapToResponse(Department department) {
        int count = userRepository.countByDepartmentId(department.getId());
        return DepartmentResponse.builder()
                .id(department.getId())
                .name(department.getName())
                .headId(department.getHead() != null ? department.getHead().getId() : null)
                .headName(department.getHead() != null ? department.getHead().getFullName() : null)
                .teacherCount(count)
                .build();
    }
}
