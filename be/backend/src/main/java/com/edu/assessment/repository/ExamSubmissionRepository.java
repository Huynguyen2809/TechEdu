package com.edu.assessment.repository;

import com.edu.assessment.entity.ExamSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExamSubmissionRepository extends JpaRepository<ExamSubmission, Long> {
    boolean existsByExamIdAndStudentId(Long examId, Long studentId);
    long countByExamId(Long examId);
    Optional<ExamSubmission> findByExamIdAndStudentId(Long examId, Long studentId);

    // [FIX N+1] Lay danh sach bai nop KEM THEO thong tin Student trong 1 cau SQL duy nhat,
    // tranh Hibernate phat sinh N query phu khi truy cap sub.getStudent().getFullName()
    @Query("SELECT s FROM ExamSubmission s LEFT JOIN FETCH s.student st WHERE s.exam.id = :examId ORDER BY s.totalScore DESC")
    List<ExamSubmission> findAllByExamIdWithStudentOrderByTotalScoreDesc(@Param("examId") Long examId);

    // [STUDENT HISTORY] Lay toan bo lich su lam bai cua 1 hoc sinh,
    // JOIN FETCH exam va class de tranh N+1 khi doc ten de thi, ten lop
    @Query("SELECT s FROM ExamSubmission s LEFT JOIN FETCH s.exam e LEFT JOIN FETCH e.clazz WHERE s.student.id = :studentId ORDER BY s.submittedAt DESC")
    List<ExamSubmission> findAllByStudentIdWithExamOrderBySubmittedAtDesc(@Param("studentId") Long studentId);

    // [FIX N+1] Lay bai nop KEM THEO chi tiet tung cau tra loi VA thong tin Student (tranh loi Lazy Loading)
    @Query("SELECT s FROM ExamSubmission s LEFT JOIN FETCH s.answers a LEFT JOIN FETCH a.question WHERE s.id = :submissionId")
    Optional<ExamSubmission> findByIdWithAnswers(@Param("submissionId") Long submissionId);

    // [CLASS DETAIL] Lay diem moi nhat cua 1 hoc sinh trong 1 lop hoc cu the
    @Query("SELECT s FROM ExamSubmission s WHERE s.student.id = :studentId AND s.exam.clazz.id = :classId ORDER BY s.submittedAt DESC LIMIT 1")
    Optional<ExamSubmission> findLatestByStudentIdAndClassId(@Param("studentId") Long studentId, @Param("classId") Long classId);

    // [CLASS DETAIL] Lay toan bo bai nop cua tat ca hoc sinh trong 1 lop (dung de tinh diem nhanh toan bo)
    @Query("SELECT s FROM ExamSubmission s WHERE s.exam.clazz.id = :classId ORDER BY s.student.id ASC, s.submittedAt DESC")
    List<ExamSubmission> findAllByClassIdOrderByStudentAndDate(@Param("classId") Long classId);

    // [FIX N+1] Lay tat ca bai nop cua 1 hoc sinh doi voi nhieu de thi cung luc
    @Query("SELECT s FROM ExamSubmission s WHERE s.student.id = :studentId AND s.exam.id IN :examIds")
    List<ExamSubmission> findAllByExamIdInAndStudentId(@Param("examIds") List<Long> examIds, @Param("studentId") Long studentId);
}