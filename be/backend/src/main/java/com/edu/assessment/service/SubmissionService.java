package com.edu.assessment.service;

import com.edu.assessment.entity.*;
import com.edu.assessment.repository.ExamSubmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * SubmissionService — Nghiep vu xem lich su lam bai danh cho Hoc sinh.
 * Phan quyen bao mat: Hoc sinh chi duoc xem bai cua chinh minh.
 */
@Service
@RequiredArgsConstructor
public class SubmissionService {

    private final ExamSubmissionRepository submissionRepository;

    /**
     * Lay danh sach tat ca bai thi da nop cua 1 hoc sinh.
     * Tra ve: examTitle, className, subjectName, totalScore, submittedAt, timeSpentSeconds, submissionId.
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getMyHistory(Long studentId) {
        List<ExamSubmission> submissions =
                submissionRepository.findAllByStudentIdWithExamOrderBySubmittedAtDesc(studentId);

        return submissions.stream().map(sub -> {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("submissionId", sub.getId());
            item.put("examId", sub.getExam().getId());
            item.put("examTitle", sub.getExam().getTitle());
            item.put("className", sub.getExam().getClazz().getName());
            item.put("subjectName", sub.getExam().getClazz().getSubjectName());
            item.put("totalScore", sub.getTotalScore());
            item.put("timeSpentSeconds", sub.getTimeSpentSeconds());
            item.put("submittedAt", sub.getSubmittedAt().toString());
            item.put("durationMinutes", sub.getExam().getDurationMinutes());
            return item;
        }).toList();
    }

    /**
     * Lay chi tiet bai lam cua hoc sinh: tung cau hoi, dap an hoc sinh chon,
     * dap an chuan va diem dat duoc.
     * Bao mat: Chi dung chu nhan bai nop moi duoc xem.
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getMySubmissionDetail(Long submissionId, Long studentId) {
        ExamSubmission sub = submissionRepository.findByIdWithAnswers(submissionId)
                .orElseThrow(() -> new IllegalArgumentException("Bai nop khong ton tai hoac da bi xoa!"));

        // [PHAN QUYEN BAO MAT] Chi chinh hoc sinh nop bai moi duoc xem chi tiet
        if (!sub.getStudent().getId().equals(studentId)) {
            throw new IllegalStateException("Ban khong co quyen xem bai lam cua nguoi khac!");
        }

        Exam exam = sub.getExam();
        Exam.ExplanationPolicy policy = exam.getExplanationPolicy() != null ? exam.getExplanationPolicy() : Exam.ExplanationPolicy.AFTER_EXAM_END;
        boolean canViewExplanation = false;
        if (policy == Exam.ExplanationPolicy.IMMEDIATELY) {
            canViewExplanation = true;
        } else if (policy == Exam.ExplanationPolicy.AFTER_EXAM_END) {
            if (java.time.LocalDateTime.now().isAfter(exam.getEndTime()) || java.time.LocalDateTime.now().isEqual(exam.getEndTime())) {
                canViewExplanation = true;
            }
        } else {
            // NEVER
            canViewExplanation = false;
        }

        final boolean finalCanView = canViewExplanation;

        // Sap xep cau tra loi theo thu tu cau hoi 1, 2, 3...
        List<SubmissionAnswer> sortedAnswers = sub.getAnswers().stream()
                .sorted(Comparator.comparingInt(a -> a.getQuestion().getQuestionNumber()))
                .toList();

        List<Map<String, Object>> answerDetails = sortedAnswers.stream().map(a -> {
            ExamQuestion q = a.getQuestion();
            Map<String, Object> detail = new LinkedHashMap<>();
            detail.put("questionNumber", q.getQuestionNumber());
            detail.put("partType", q.getPartType().name());
            detail.put("maxPoints", q.getPoints());
            detail.put("earnedPoints", a.getEarnedPoints());
            detail.put("isCorrect", a.getIsCorrect());
            detail.put("studentAnswer", a.getStudentAnswer() != null ? a.getStudentAnswer() : "BO_TRONG");
            detail.put("correctAnswer", finalCanView ? q.getCorrectAnswer() : "🔒 Đã ẩn");
            detail.put("rightAnswer", finalCanView ? q.getCorrectAnswer() : "🔒 Đã ẩn");
            return detail;
        }).toList();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("submissionId", sub.getId());
        result.put("examTitle", exam.getTitle());
        result.put("className", exam.getClazz().getName());
        result.put("totalScore", sub.getTotalScore());
        result.put("timeSpentSeconds", sub.getTimeSpentSeconds());
        result.put("submittedAt", sub.getSubmittedAt().toString());
        result.put("endTime", exam.getEndTime().toString());
        result.put("explanationPolicy", policy.name());
        result.put("canViewExplanation", canViewExplanation);
        result.put("examFileUrl", exam.getDocument() != null ? exam.getDocument().getFileUrl() : null);
        result.put("explanationFileUrl", exam.getExplanationDocument() != null ? exam.getExplanationDocument().getFileUrl() : null);
        result.put("details", answerDetails);
        return result;
    }
}
