package com.edu.assessment.repository;

import com.edu.assessment.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByPhoneNumber(String phoneNumber);
    boolean existsByPhoneNumber(String phoneNumber);

    // Dem so luong theo Role
    long countByRole(User.Role role);

    // Tim kiem nguoi dung theo Role (Admin quan ly)
    List<User> findAllByRoleOrderByCreatedAtDesc(User.Role role);

    // Tim kiem theo ten hoac so dien thoai (LIKE search)
    @Query("SELECT u FROM User u WHERE u.role = :role AND (LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR u.phoneNumber LIKE CONCAT('%', :keyword, '%')) ORDER BY u.createdAt DESC")
    List<User> searchByRoleAndKeyword(@Param("role") User.Role role, @Param("keyword") String keyword);

    // Lay tat ca nguoi dung khong phai Center Manager (de Center Manager quan ly)
    @Query("SELECT u FROM User u WHERE u.role != 'CENTER_MANAGER' ORDER BY u.role ASC, u.createdAt DESC")
    List<User> findAllNonCenterManagerUsersOrderByRole();

    int countByDepartmentId(Long departmentId);
}