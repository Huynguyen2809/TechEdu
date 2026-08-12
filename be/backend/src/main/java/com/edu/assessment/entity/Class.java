package com.edu.assessment.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "classes", indexes = {
        @Index(name = "idx_join_code", columnList = "join_code"),
        @Index(name = "idx_teacher_id", columnList = "teacher_id")
})
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Class {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Lớp học này do Giáo viên nào tạo
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", nullable = false)
    private User teacher;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @Column(name = "name", length = 100, nullable = false)
    private String name; // Ví dụ: "12A1 - Luyện thi Đại học Toán"

    @Column(name = "subject_name", length = 50, nullable = false)
    private String subjectName; // Ví dụ: "Toán học", "Vật lý", "Hóa học"

    @Column(name = "grade_level", nullable = false)
    private Integer gradeLevel; // Ví dụ: 10, 11, 12

    @Column(name = "join_code", length = 8, nullable = false, unique = true)
    private String joinCode; // Mã 6 ký tự tự sinh, ví dụ: "TOAN12X"

    @Column(name = "is_archived", nullable = false)
    @Builder.Default
    private Boolean isArchived = false; // Lớp còn hoạt động hay đã lưu trữ

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}