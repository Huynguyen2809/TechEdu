package com.edu.assessment.repository;

import com.edu.assessment.entity.Folder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FolderRepository extends JpaRepository<Folder, Long> {
    // Lấy danh sách thư mục con của một thư mục cha (của cùng 1 GV)
    List<Folder> findAllByTeacherIdAndParentId(Long teacherId, Long parentId);

    // Lấy danh sách thư mục ngoài Root (parentId is null)
    List<Folder> findAllByTeacherIdAndParentIsNull(Long teacherId);

    // Lấy tất cả thư mục của 1 giáo viên
    List<Folder> findAllByTeacherId(Long teacherId);

    boolean existsByTeacherIdAndNameAndParentId(Long teacherId, String name, Long parentId);
}