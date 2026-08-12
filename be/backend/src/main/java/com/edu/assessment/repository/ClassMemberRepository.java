package com.edu.assessment.repository;

import com.edu.assessment.entity.ClassMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ClassMemberRepository extends JpaRepository<ClassMember, Long> {
    boolean existsByClazzIdAndStudentId(Long classId, Long studentId);
    Optional<ClassMember> findByClazzIdAndStudentId(Long classId, Long studentId);
    List<ClassMember> findAllByStudentIdAndStatus(Long studentId, ClassMember.Status status);
    long countByClazzIdAndStatus(Long clazzId, ClassMember.Status status);
    List<ClassMember> findAllByClazzIdAndStatus(Long clazzId, ClassMember.Status status);

    @Query("SELECT cm FROM ClassMember cm JOIN FETCH cm.clazz c JOIN FETCH c.teacher WHERE cm.student.id = :studentId AND cm.status = :status")
    List<ClassMember> findAllByStudentIdAndStatusWithClassAndTeacher(@Param("studentId") Long studentId, @Param("status") ClassMember.Status status);

    @Query("SELECT cm FROM ClassMember cm JOIN FETCH cm.student WHERE cm.clazz.id = :clazzId AND cm.status = :status")
    List<ClassMember> findAllByClazzIdAndStatusWithStudent(@Param("clazzId") Long clazzId, @Param("status") ClassMember.Status status);
}