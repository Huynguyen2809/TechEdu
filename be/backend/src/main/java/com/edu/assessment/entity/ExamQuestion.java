package com.edu.assessment.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "exam_questions", indexes = {
        @Index(name = "idx_eq_exam", columnList = "exam_id")
})
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ExamQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_id", nullable = false)
    private Exam exam;

    @Column(name = "question_number", nullable = false)
    private Integer questionNumber; // Câu số: 1, 2, 3...

    @Enumerated(EnumType.STRING)
    @Column(name = "part_type", nullable = false, length = 30)
    private PartType partType;

    /**
     * Quy ước lưu Đáp án chuẩn (Correct Answer):
     * - PART_1_ABCD: Lưu chữ cái "A", "B", "C", hoặc "D".
     * - PART_2_TRUE_FALSE: Lưu chuỗi 4 ý a,b,c,d cách nhau bởi dấu phẩy, ví dụ: "D,S,D,S" (Đúng, Sai, Đúng, Sai).
     * - PART_3_SHORT_ANSWER: Lưu số liệu tối đa 4 ký tự/chữ số, ví dụ: "1024", "-3.5", "0,25".
     */
    @Column(name = "correct_answer", length = 50, nullable = false)
    private String correctAnswer;

    @Column(name = "points", nullable = false)
    private Double points; // Điểm số cho câu này (ví dụ 0.25 điểm)

    public enum PartType {
        PART_1_ABCD,         // Trắc nghiệm 4 lựa chọn
        PART_2_TRUE_FALSE,   // Trắc nghiệm Đúng/Sai
        PART_3_SHORT_ANSWER  // Trắc nghiệm trả lời ngắn (Điền số)
    }
}