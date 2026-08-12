package com.edu.assessment.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "folders", indexes = {
        @Index(name = "idx_folder_teacher", columnList = "teacher_id"),
        @Index(name = "idx_folder_parent", columnList = "parent_id")
})
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Folder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", nullable = false)
    private User teacher;

    // Khóa ngoại đệ quy: Trỏ về chính Folder cha. Nếu null nghĩa là Thư mục gốc (Root)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Folder parent;

    @Column(name = "name", length = 100, nullable = false)
    private String name; // Ví dụ: "Đề thi Học kỳ 1 - Khối 12"

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "is_department_material", nullable = false)
    @Builder.Default
    private Boolean isDepartmentMaterial = false;
}