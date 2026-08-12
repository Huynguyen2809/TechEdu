package com.edu.assessment.service;

import com.edu.assessment.entity.*;
import com.edu.assessment.repository.ExamRepository;
import com.edu.assessment.repository.ExamSubmissionRepository;
import com.edu.assessment.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GradebookService {

    private final ExamRepository examRepository;
    private final ExamSubmissionRepository submissionRepository;
    private final UserRepository userRepository;

    // 1. Nghiệp vụ: Xem bảng điểm tổng quan của 1 Kỳ thi (Dành cho Giáo viên)
    public Map<String, Object> getExamGradebook(Long examId, Long teacherId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new IllegalArgumentException("Bài kiểm tra không tồn tại"));

        if (!exam.getTeacher().getId().equals(teacherId)) {
            throw new IllegalStateException("Bạn không có quyền xem bảng điểm của bài kiểm tra này!");
        }

        List<ExamSubmission> submissions = submissionRepository.findAllByExamIdWithStudentOrderByTotalScoreDesc(examId);

        List<Map<String, Object>> studentScores = submissions.stream().map(sub -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("submissionId", sub.getId());
            map.put("studentId", sub.getStudent().getId());
            map.put("fullName", sub.getStudent().getFullName());
            map.put("phoneNumber", sub.getStudent().getPhoneNumber());
            map.put("totalScore", sub.getTotalScore());
            map.put("timeSpentSeconds", sub.getTimeSpentSeconds());
            map.put("submittedAt", sub.getSubmittedAt().toString());
            return map;
        }).toList();

        // Tính thống kê nhanh (Điểm cao nhất, thấp nhất, trung bình)
        double avgScore = submissions.stream().mapToDouble(ExamSubmission::getTotalScore).average().orElse(0.0);
        double maxScore = submissions.stream().mapToDouble(ExamSubmission::getTotalScore).max().orElse(0.0);
        double minScore = submissions.stream().mapToDouble(ExamSubmission::getTotalScore).min().orElse(0.0);

        return Map.of(
                "examId", exam.getId(),
                "examTitle", exam.getTitle(),
                "className", exam.getClazz().getName(),
                "totalSubmissions", submissions.size(),
                "statistics", Map.of(
                        "averageScore", Math.round(avgScore * 100.0) / 100.0,
                        "maxScore", maxScore,
                        "minScore", minScore
                ),
                "scores", studentScores
        );
    }

    // 2. Nghiệp vụ: Xem chi tiết bài làm của 1 Học sinh (Đối chiếu đáp án)
    @Transactional(readOnly = true)
    public Map<String, Object> getSubmissionDetail(Long submissionId, Long teacherId) {
        ExamSubmission sub = submissionRepository.findByIdWithAnswers(submissionId)
                .orElseThrow(() -> new IllegalArgumentException("Bài nộp không tồn tại"));

        if (!sub.getExam().getTeacher().getId().equals(teacherId)) {
            throw new IllegalStateException("Bạn không có quyền xem bài làm này!");
        }

        // Sắp xếp câu trả lời theo thứ tự câu hỏi 1, 2, 3...
        List<SubmissionAnswer> sortedAnswers = sub.getAnswers().stream()
                .sorted(Comparator.comparingInt(a -> a.getQuestion().getQuestionNumber()))
                .toList();

        List<Map<String, Object>> answerDetails = sortedAnswers.stream().map(a -> {
            ExamQuestion q = a.getQuestion();
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("questionNumber", q.getQuestionNumber());
            map.put("partType", q.getPartType().name());
            map.put("maxPoints", q.getPoints());
            map.put("earnedPoints", a.getEarnedPoints());
            map.put("isCorrect", a.getIsCorrect());
            map.put("correctAnswer", q.getCorrectAnswer()); // Đáp án chuẩn của thầy
            map.put("studentAnswer", a.getStudentAnswer() != null ? a.getStudentAnswer() : "BỎ TRỐNG"); // Đáp án học sinh làm
            return map;
        }).toList();

        return Map.of(
                "submissionId", sub.getId(),
                "studentName", sub.getStudent().getFullName(),
                "examTitle", sub.getExam().getTitle(),
                "totalScore", sub.getTotalScore(),
                "timeSpentSeconds", sub.getTimeSpentSeconds(),
                "details", answerDetails
        );
    }

    // 3. Nghiệp vụ: Xuất file Excel (.xlsx) Bảng điểm chuyên nghiệp
    public byte[] exportGradebookToExcel(Long examId, Long teacherId) throws IOException {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new IllegalArgumentException("Bài kiểm tra không tồn tại"));

        if (!exam.getTeacher().getId().equals(teacherId)) {
            throw new IllegalStateException("Bạn không có quyền xuất dữ liệu của kỳ thi này!");
        }

        List<ExamSubmission> submissions = submissionRepository.findAllByExamIdWithStudentOrderByTotalScoreDesc(examId);

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Bảng Điểm - " + exam.getClazz().getName());

            // --- Tạo Style cho Tiêu đề (Bold, Nền xanh xám) ---
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);
            headerStyle.setBorderBottom(BorderStyle.THIN);

            // --- Tạo Style cho dữ liệu ---
            CellStyle dataStyle = workbook.createCellStyle();
            dataStyle.setBorderBottom(BorderStyle.THIN);
            dataStyle.setBorderTop(BorderStyle.THIN);
            dataStyle.setBorderLeft(BorderStyle.THIN);
            dataStyle.setBorderRight(BorderStyle.THIN);

            // 1. Dòng thông tin kỳ thi
            Row infoRow = sheet.createRow(0);
            infoRow.createCell(0).setCellValue("BẢNG ĐIỂM KỲ THI: " + exam.getTitle().toUpperCase());
            Row classRow = sheet.createRow(1);
            classRow.createCell(0).setCellValue("Lớp học: " + exam.getClazz().getName() + " | Môn: " + exam.getClazz().getSubjectName());

            // 2. Tạo Header Row (Dòng 3)
            String[] columns = {"STT", "Họ và Tên", "Số Điện Thoại", "Tổng Điểm (10)", "Thời Gian Làm (Phút)", "Thời Điểm Nộp Bài"};
            Row headerRow = sheet.createRow(3);
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }

            // 3. Đổ dữ liệu Học sinh vào từng dòng
            int rowIdx = 4;
            int stt = 1;
            for (ExamSubmission sub : submissions) {
                Row row = sheet.createRow(rowIdx++);

                Cell c0 = row.createCell(0); c0.setCellValue(stt++); c0.setCellStyle(dataStyle);
                Cell c1 = row.createCell(1); c1.setCellValue(sub.getStudent().getFullName()); c1.setCellStyle(dataStyle);
                Cell c2 = row.createCell(2); c2.setCellValue(sub.getStudent().getPhoneNumber()); c2.setCellStyle(dataStyle);
                Cell c3 = row.createCell(3); c3.setCellValue(sub.getTotalScore()); c3.setCellStyle(dataStyle);

                // Đổi giây ra phút:giây cho đẹp (ví dụ: 1200s -> 20.0 phút)
                double minutes = Math.round((sub.getTimeSpentSeconds() / 60.0) * 10.0) / 10.0;
                Cell c4 = row.createCell(4); c4.setCellValue(minutes + " phút"); c4.setCellStyle(dataStyle);

                Cell c5 = row.createCell(5); c5.setCellValue(sub.getSubmittedAt().toString().replace("T", " ").substring(0, 19)); c5.setCellStyle(dataStyle);
            }

            // Tự động căn chỉnh độ rộng cột (Auto-fit)
            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }
}