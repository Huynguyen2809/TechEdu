package com.edu.assessment.repository;

import com.edu.assessment.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
    boolean existsByName(String name);
    boolean existsByNameAndIdNot(String name, Long id);
    boolean existsByHeadId(Long headId);
    boolean existsByHeadIdAndIdNot(Long headId, Long id);
}
