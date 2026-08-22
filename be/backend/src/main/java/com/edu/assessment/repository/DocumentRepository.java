package com.edu.assessment.repository;

import com.edu.assessment.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findAllByTeacherIdAndFolderId(Long teacherId, Long folderId);

    List<Document> findAllByTeacherIdAndFolderIsNull(Long teacherId);

    List<Document> findAllByFileTypeOrderByIdDesc(Document.FileType fileType);

    List<Document> findAllByFileTypeAndDepartmentIdOrderByIdDesc(Document.FileType fileType, Long departmentId);

    List<Document> findAllByFileTypeAndDepartmentIsNullOrderByIdDesc(Document.FileType fileType);

    List<Document> findAllByFileTypeAndDepartmentIdOrFileTypeAndDepartmentIsNullOrderByIdDesc(
            Document.FileType fileType1, Long departmentId,
            Document.FileType fileType2);

    long countByFileType(Document.FileType fileType);
}