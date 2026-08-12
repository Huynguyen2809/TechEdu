package com.edu.assessment.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "documents", indexes = {
        @Index(name = "idx_doc_teacher", columnList = "teacher_id"),
        @Index(name = "idx_doc_folder", columnList = "folder_id")
})
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", nullable = false)
    private User teacher;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "folder_id")
    private Folder folder; // Nằm trong thư mục nào (null = Nằm ngoài Root)

    @Column(name = "title", length = 255, nullable = false)
    private String title; // Tên file hiển thị trên UI, ví dụ: "De_thi_giua_ky_Toan_12.pdf"

    @Column(name = "file_url", length = 500, nullable = false)
    private String fileUrl; // Đường dẫn tới file lưu trên ổ cứng/cloud

    @Enumerated(EnumType.STRING)
    @Column(name = "file_type", nullable = false, length = 20)
    private FileType fileType;

    @Column(name = "file_size_kb", nullable = false)
    private Long fileSizeKb; // Dung lượng file tính bằng KB

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "is_department_material", nullable = false)
    @Builder.Default
    private Boolean isDepartmentMaterial = false;

    public enum FileType {
        EXAM,        // File PDF đề thi
        EXPLANATION, // File PDF lời giải chi tiết
        SHARED_MATERIAL // Tài liệu chung của trung tâm
    }
}