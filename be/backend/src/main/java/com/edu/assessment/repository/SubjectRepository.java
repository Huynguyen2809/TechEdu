package com.edu.assessment.repository;

import com.edu.assessment.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {
    List<Subject> findAllByOrderByGradeLevelAscIdAsc();
    List<Subject> findByGradeLevelOrderByIdAsc(Integer gradeLevel);
    boolean existsByNameAndGradeLevel(String name, Integer gradeLevel);
}
