package com.edu.assessment.repository;

import com.edu.assessment.entity.Exam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ExamRepository extends JpaRepository<Exam, Long> {
    List<Exam> findAllByClazzIdOrderByStartTimeDesc(Long classId);
    List<Exam> findAllByTeacherIdOrderByCreatedAtDesc(Long teacherId);
    List<Exam> findAllByClazzIdAndIsPublishedTrueOrderByStartTimeDesc(Long clazzId);
}