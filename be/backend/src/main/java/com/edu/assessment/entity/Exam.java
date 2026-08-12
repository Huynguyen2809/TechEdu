package com.edu.assessment.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "exams")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Exam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", nullable = false)
    private User teacher;

    // Bài kiểm tra này dành cho Lớp học nào
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id", nullable = false)
    private Class clazz;

    // Sử dụng đề thi PDF nào từ Ngân hàng đề
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false)
    private Document document;

    @Column(name = "title", length = 200, nullable = false)
    private String title; // Ví dụ: "Kiểm tra Giữa kỳ 1 - Toán 12"

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes; // Thời gian làm bài (phút), ví dụ: 45, 90

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime; // Thời gian bắt đầu mở đề

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime; // Thời gian đóng đề

    // Cấu hình số lượng câu hỏi theo chuẩn Bộ GD&ĐT Việt Nam
    @Column(name = "part1_count", nullable = false)
    private Integer part1Count; // Số câu Trắc nghiệm ABCD (Thường là 12 câu)

    @Column(name = "part2_count", nullable = false)
    private Integer part2Count; // Số câu Đúng/Sai a-b-c-d (Thường là 4 câu)

    @Column(name = "part3_count", nullable = false)
    private Integer part3Count; // Số câu Trả lời ngắn / Điền số (Thường là 6 câu)

    @Column(name = "is_published", nullable = false)
    @Builder.Default
    private Boolean isPublished = true; // Giáo viên có thể ẩn/hiện đề

    public enum ExplanationPolicy {
        IMMEDIATELY,
        AFTER_EXAM_END,
        NEVER
    }

    // File lời giải chi tiết PDF từ Ngân hàng đề (tùy chọn)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "explanation_document_id")
    private Document explanationDocument;

    // Chính sách cho phép học sinh xem lời giải
    @Enumerated(EnumType.STRING)
    @Column(name = "explanation_policy", nullable = false, length = 20)
    @Builder.Default
    private ExplanationPolicy explanationPolicy = ExplanationPolicy.AFTER_EXAM_END;

    @OneToMany(mappedBy = "exam", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ExamQuestion> questions;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}