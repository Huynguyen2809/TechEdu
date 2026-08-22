package com.edu.assessment.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "class_members", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"class_id", "student_id"}) // 1 HS chỉ được gia nhập 1 lớp 1 lần
})
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ClassMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id", nullable = false)
    private Class clazz; // Dùng từ clazz để tránh trùng từ khóa class của Java

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private Status status = Status.ACTIVE;

    @CreationTimestamp
    @Column(name = "joined_at", updatable = false)
    private LocalDateTime joinedAt;

    public enum Status {
        ACTIVE,   // Đang học
        REMOVED,  // Bị giáo viên xóa khỏi lớp
        PENDING   // Đang chờ giáo viên duyệt
    }
}