package com.edu.assessment.repository;

import com.edu.assessment.entity.Class;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ClassRepository extends JpaRepository<Class, Long> {
    Optional<Class> findByJoinCode(String joinCode);
    boolean existsByJoinCode(String joinCode);
    List<Class> findAllByTeacherIdAndIsArchivedFalse(Long teacherId);
}