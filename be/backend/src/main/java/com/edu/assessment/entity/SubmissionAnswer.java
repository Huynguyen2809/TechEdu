package com.edu.assessment.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "submission_answers", indexes = {
        @Index(name = "idx_sub_ans_submission", columnList = "submission_id")
})
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class SubmissionAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submission_id", nullable = false)
    private ExamSubmission submission;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private ExamQuestion question;

    @Column(name = "student_answer", length = 50)
    private String studentAnswer; // Đáp án học sinh gửi lên: "A", "D,S,D,S", "-3,25"...

    @Column(name = "earned_points", nullable = false)
    private Double earnedPoints; // Điểm nhận được cho riêng câu này

    @Column(name = "is_correct", nullable = false)
    private Boolean isCorrect; // Đúng hoàn toàn (100%) hay không
}