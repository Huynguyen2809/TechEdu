package com.edu.assessment.service;

import com.edu.assessment.dto.request.CreateExamRequest;
import com.edu.assessment.dto.request.SubmitExamRequest;
import com.edu.assessment.entity.*;
import com.edu.assessment.entity.Class;
import com.edu.assessment.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ExamService {

    private final ExamRepository examRepository;
    private final ExamQuestionRepository examQuestionRepository;
    private final ClassRepository classRepository;
    private final DocumentRepository documentRepository;
    private final ClassMemberRepository classMemberRepository;
    private final UserRepository userRepository;
    private final ExamSubmissionRepository examSubmissionRepository;

    // Hàm chốt chặn bảo mật dùng chung: Kiểm tra lớp có bị ẩn hoặc học sinh bị xóa không
    private void validateStudentAccessToClass(Long classId, Long studentId) {
        ClassMember member = classMemberRepository.findByClazzIdAndStudentId(classId, studentId)
                .orElseThrow(() -> new IllegalStateException("Bạn không thuộc lớp học này!"));

        // 1. Kiểm tra trạng thái của học sinh
        if (member.getStatus() != ClassMember.Status.ACTIVE) {
            throw new IllegalStateException("Tài khoản của bạn đã bị vô hiệu hóa khỏi lớp học này. Bạn không thể xem bất kỳ dữ liệu nào!");
        }

        // 2. Kiểm tra trạng thái của lớp học
        if (member.getClazz().getIsArchived()) {
            throw new IllegalStateException("Lớp học này đã bị đóng/ẩn. Toàn bộ dữ liệu bài thi không còn khả dụng!");
        }
    }

    // Nghiệp vụ 1: Giáo viên tạo bài kiểm tra mới kèm Đáp án chuẩn
    @Transactional
    public Map<String, Object> createExam(CreateExamRequest request, Long teacherId) {
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy Giáo viên"));

        Class clazz = classRepository.findById(request.getClassId())
                .orElseThrow(() -> new IllegalArgumentException("Lớp học không tồn tại"));
        if (!clazz.getTeacher().getId().equals(teacherId)) {
            throw new IllegalStateException("Bạn không có quyền tạo bài kiểm tra cho lớp của người khác!");
        }

        Document document = documentRepository.findById(request.getDocumentId())
                .orElseThrow(() -> new IllegalArgumentException("File tài liệu PDF không tồn tại"));
        if (!document.getTeacher().getId().equals(teacherId)) {
            throw new IllegalStateException("Bạn không có quyền sử dụng file tài liệu này!");
        }

        Document explanationDoc = null;
        if (request.getExplanationDocumentId() != null) {
            explanationDoc = documentRepository.findById(request.getExplanationDocumentId())
                    .orElseThrow(() -> new IllegalArgumentException("File lời giải PDF không tồn tại"));
            if (!explanationDoc.getTeacher().getId().equals(teacherId)) {
                throw new IllegalStateException("Bạn không có quyền sử dụng file lời giải này!");
            }
        }

        Exam.ExplanationPolicy policy = Exam.ExplanationPolicy.AFTER_EXAM_END;
        if (request.getExplanationPolicy() != null && !request.getExplanationPolicy().trim().isEmpty()) {
            try {
                policy = Exam.ExplanationPolicy.valueOf(request.getExplanationPolicy().trim().toUpperCase());
            } catch (Exception ignored) {}
        }

        int totalConfigured = request.getPart1Count() + request.getPart2Count() + request.getPart3Count();
        if (request.getAnswerKeys().size() != totalConfigured) {
            throw new IllegalArgumentException("Tổng số câu cấu hình (" + totalConfigured + ") không khớp với số lượng đáp án gửi lên (" + request.getAnswerKeys().size() + ")!");
        }

        double totalConfiguredPoints = request.getAnswerKeys().stream()
                .mapToDouble(CreateExamRequest.QuestionAnswerDto::getPoints)
                .sum();
        if (totalConfiguredPoints - 10.0 > 0.001) {
            throw new IllegalArgumentException("Quy chế vi phạm: Tổng điểm các câu hỏi là " + totalConfiguredPoints + " điểm. Vui lòng điều chỉnh để tổng điểm không vượt quá thang điểm 10.0!");
        }

        Exam exam = Exam.builder()
                .title(request.getTitle())
                .teacher(teacher)
                .clazz(clazz)
                .document(document)
                .explanationDocument(explanationDoc)
                .explanationPolicy(policy)
                .durationMinutes(request.getDurationMinutes())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .part1Count(request.getPart1Count())
                .part2Count(request.getPart2Count())
                .part3Count(request.getPart3Count())
                .isPublished(true)
                .build();

        examRepository.save(exam);

        List<ExamQuestion> questionEntities = new ArrayList<>();
        for (CreateExamRequest.QuestionAnswerDto dto : request.getAnswerKeys()) {
            ExamQuestion.PartType partType;
            try {
                partType = ExamQuestion.PartType.valueOf(dto.getPartType().toUpperCase());
            } catch (Exception e) {
                throw new IllegalArgumentException("Loại phần thi không hợp lệ tại câu số " + dto.getQuestionNumber());
            }

            String cleanAnswer = dto.getCorrectAnswer().trim().toUpperCase();

            ExamQuestion question = ExamQuestion.builder()
                    .exam(exam)
                    .questionNumber(dto.getQuestionNumber())
                    .partType(partType)
                    .correctAnswer(cleanAnswer)
                    .points(dto.getPoints())
                    .build();
            questionEntities.add(question);
        }
        examQuestionRepository.saveAll(questionEntities);

        return Map.of(
                "message", "Tạo bài kiểm tra thành công!",
                "examId", exam.getId(),
                "totalQuestions", questionEntities.size()
        );
    }

    // Nghiệp vụ 2: Lấy dữ liệu cho phòng thi Split-screen
    public Map<String, Object> getExamForTaking(Long examId, Long studentId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new IllegalArgumentException("Bài kiểm tra không tồn tại"));

        // GỌI HÀM BẢO MẬT: Kiểm tra lớp bị ẩn hoặc học sinh bị xóa
        validateStudentAccessToClass(exam.getClazz().getId(), studentId);

        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(exam.getStartTime())) {
            throw new IllegalStateException("Chưa đến giờ làm bài! Bài thi mở lúc: " + exam.getStartTime());
        }
        if (now.isAfter(exam.getEndTime())) {
            throw new IllegalStateException("Đã hết thời gian làm bài kiểm tra này!");
        }

        List<ExamQuestion> questions = examQuestionRepository.findAllByExamIdOrderByQuestionNumberAsc(examId);
        List<Map<String, Object>> answerSheetStructure = questions.stream().map(q -> Map.<String, Object>of(
                "id", q.getId(),
                "questionNumber", q.getQuestionNumber(),
                "partType", q.getPartType().name(),
                "points", q.getPoints()
        )).toList();

        return Map.of(
                "examId", exam.getId(),
                "title", exam.getTitle(),
                "durationMinutes", exam.getDurationMinutes(),
                "pdfUrl", exam.getDocument().getFileUrl(),
                "config", Map.of(
                        "part1Count", exam.getPart1Count(),
                        "part2Count", exam.getPart2Count(),
                        "part3Count", exam.getPart3Count()
                ),
                "answerSheetStructure", answerSheetStructure
        );
    }

    private Double calculatePointsForQuestion(ExamQuestion question, String studentAns) {
        if (studentAns == null || studentAns.trim().isEmpty()) {
            return 0.0;
        }

        String cleanStudentAns = studentAns.trim().toUpperCase();
        String cleanCorrectAns = question.getCorrectAnswer().trim().toUpperCase();
        Double maxPoints = question.getPoints();

        switch (question.getPartType()) {
            case PART_1_ABCD:
                return cleanStudentAns.equals(cleanCorrectAns) ? maxPoints : 0.0;

            case PART_2_TRUE_FALSE:
                String[] studentParts = cleanStudentAns.split(",");
                String[] correctParts = cleanCorrectAns.split(",");

                if (studentParts.length != 4 || correctParts.length != 4) {
                    return 0.0;
                }

                int correctCount = 0;
                for (int i = 0; i < 4; i++) {
                    if (studentParts[i].trim().equals(correctParts[i].trim())) {
                        correctCount++;
                    }
                }

                if (correctCount == 4) return maxPoints * 1.00;
                if (correctCount == 3) return maxPoints * 0.50;
                if (correctCount == 2) return maxPoints * 0.25;
                if (correctCount == 1) return maxPoints * 0.10;
                return 0.0;

            case PART_3_SHORT_ANSWER:
                // [FIX Rule 3] Chuẩn hóa đúng chiều: dấu phẩy -> dấu chấm (vd: "-3,25" -> "-3.25")
                // Áp dụng cho CẢ HAI phía: đáp án học sinh và đáp án chuẩn (phòng trường hợp GV nhập dấu phẩy)
                String normalizedStudent = cleanStudentAns.replace(",", ".");
                String normalizedCorrect = cleanCorrectAns.replace(",", ".");
                return normalizedStudent.equals(normalizedCorrect) ? maxPoints : 0.0;

            default:
                return 0.0;
        }
    }

    // Nghiệp vụ 3: Học sinh nộp bài và nhận kết quả chấm điểm
    @Transactional
    public Map<String, Object> submitExam(Long examId, SubmitExamRequest request, Long studentId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new IllegalArgumentException("Bài kiểm tra không tồn tại"));

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy Học sinh"));

        // GỌI HÀM BẢO MẬT: Chặn nộp bài nếu lớp vừa bị xóa hoặc học sinh vừa bị đuổi
        validateStudentAccessToClass(exam.getClazz().getId(), studentId);

        if (examSubmissionRepository.existsByExamIdAndStudentId(examId, studentId)) {
            throw new IllegalStateException("Bạn đã nộp bài cho đề thi này rồi! Không thể nộp lại.");
        }

        if (LocalDateTime.now().isAfter(exam.getEndTime().plusMinutes(2))) {
            throw new IllegalStateException("Đã quá thời gian nộp bài quy định!");
        }

        List<ExamQuestion> examQuestions = examQuestionRepository.findAllByExamIdOrderByQuestionNumberAsc(examId);
        Map<Long, ExamQuestion> questionMap = new HashMap<>();
        for (ExamQuestion q : examQuestions) {
            questionMap.put(q.getId(), q);
        }

        double totalEarnedScore = 0.0;
        List<SubmissionAnswer> submissionAnswers = new ArrayList<>();

        for (SubmitExamRequest.AnswerDto ansDto : request.getAnswers()) {
            ExamQuestion question = questionMap.get(ansDto.getQuestionId());
            if (question == null) continue;

            Double earned = calculatePointsForQuestion(question, ansDto.getStudentAnswer());
            totalEarnedScore += earned;

            boolean isFullCorrect = Math.abs(earned - question.getPoints()) < 0.0001;

            SubmissionAnswer subAns = SubmissionAnswer.builder()
                    .question(question)
                    .studentAnswer(ansDto.getStudentAnswer())
                    .earnedPoints(earned)
                    .isCorrect(isFullCorrect)
                    .build();
            submissionAnswers.add(subAns);
        }

        // [FIX Rule 3] Giới hạn trần điểm tối đa 10.0 theo quy chế GD&ĐT 2025, sau đó làm tròn 2 chữ số thập phân
        totalEarnedScore = Math.min(10.0, totalEarnedScore);
        totalEarnedScore = Math.round(totalEarnedScore * 100.0) / 100.0;

        ExamSubmission submission = ExamSubmission.builder()
                .exam(exam)
                .student(student)
                .totalScore(totalEarnedScore)
                .timeSpentSeconds(request.getTimeSpentSeconds())
                .build();

        for (SubmissionAnswer sa : submissionAnswers) {
            sa.setSubmission(submission);
        }
        submission.setAnswers(submissionAnswers);

        examSubmissionRepository.save(submission);

        return Map.of(
                "message", "Nộp bài và chấm điểm thành công!",
                "submissionId", submission.getId(),
                "totalScore", submission.getTotalScore(),
                "timeSpentSeconds", submission.getTimeSpentSeconds()
        );
    }

    // Nghiệp vụ 4: Lấy danh sách bài kiểm tra dành cho Học sinh / Giáo viên trong lớp
    public List<Map<String, Object>> getExamsForClass(Long classId, Long userId, String role) {

        if ("TEACHER".equals(role) || "CENTER_MANAGER".equals(role) || "DEPARTMENT_HEAD".equals(role)) {
            // Đối với giáo viên, trả về số lượng bài nộp
            List<Exam> exams = examRepository.findAllByClazzIdAndIsPublishedTrueOrderByStartTimeDesc(classId);
            return exams.stream().map(e -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", e.getId());
                map.put("title", e.getTitle());
                map.put("durationMinutes", e.getDurationMinutes());
                map.put("startTime", e.getStartTime().toString());
                map.put("endTime", e.getEndTime().toString());
                
                long submissionCount = examSubmissionRepository.countByExamId(e.getId());
                map.put("submissionCount", submissionCount);
                return map;
            }).toList();
        } else {
            // GỌI HÀM BẢO MẬT: Nếu bị vô hiệu hóa sẽ bị chặn đứng tại đây
            validateStudentAccessToClass(classId, userId);

            List<Exam> exams = examRepository.findAllByClazzIdAndIsPublishedTrueOrderByStartTimeDesc(classId);

            List<Long> examIds = exams.stream().map(Exam::getId).toList();
            List<ExamSubmission> submissions = examIds.isEmpty() ? Collections.emptyList() 
                    : examSubmissionRepository.findAllByExamIdInAndStudentId(examIds, userId);
            
            Map<Long, ExamSubmission> submissionMap = new HashMap<>();
            for (ExamSubmission sub : submissions) {
                submissionMap.put(sub.getExam().getId(), sub);
            }

            return exams.stream().map(e -> {
                ExamSubmission sub = submissionMap.get(e.getId());
                boolean hasSubmitted = sub != null;
                Map<String, Object> map = new HashMap<>();
                map.put("id", e.getId());
                map.put("title", e.getTitle());
                map.put("durationMinutes", e.getDurationMinutes());
                map.put("startTime", e.getStartTime().toString());
                map.put("endTime", e.getEndTime().toString());
                map.put("hasSubmitted", hasSubmitted);

                if (hasSubmitted) {
                    Double totalScore = sub.getTotalScore();
                    map.put("score", totalScore);
                    map.put("finalScore", totalScore);
                    map.put("totalScore", totalScore);
                    map.put("submissionId", sub.getId());
                    map.put("submittedAt", sub.getSubmittedAt() != null ? sub.getSubmittedAt().toString() : null);

                    Map<String, Object> submissionDetailMap = new HashMap<>();
                    submissionDetailMap.put("id", sub.getId());
                    submissionDetailMap.put("score", totalScore);
                    submissionDetailMap.put("totalScore", totalScore);
                    submissionDetailMap.put("submittedAt", sub.getSubmittedAt() != null ? sub.getSubmittedAt().toString() : null);
                    map.put("submission", submissionDetailMap);
                }
                return map;
            }).toList();
        }
    }

}