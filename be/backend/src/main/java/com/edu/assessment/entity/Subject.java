package com.edu.assessment.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "subjects", indexes = {
        @Index(name = "idx_grade_level", columnList = "grade_level")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Subject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", length = 100, nullable = false)
    private String name; // Ví dụ: "Toán học", "Vật lý", "Hóa học"

    @Column(name = "code", length = 50)
    private String code; // Ví dụ: "MATH_12"

    @Column(name = "grade_level", nullable = false)
    private Integer gradeLevel; // 10, 11, 12

    @Column(name = "icon", length = 50)
    @Builder.Default
    private String icon = "BookOpen"; // "Calculator", "Atom", "Beaker", "BookOpen"

    @Column(name = "color", length = 50)
    @Builder.Default
    private String color = "indigo"; // "indigo", "violet", "amber", "emerald", "rose"

    @Column(name = "description", length = 255)
    private String description;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
