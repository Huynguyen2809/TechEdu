package com.edu.assessment.service;

import com.edu.assessment.dto.request.CreateFolderRequest;
import com.edu.assessment.entity.Document;
import com.edu.assessment.entity.Folder;
import com.edu.assessment.entity.User;
import com.edu.assessment.repository.DocumentRepository;
import com.edu.assessment.repository.FolderRepository;
import com.edu.assessment.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;

@Service
@RequiredArgsConstructor
public class RepositoryService {

    private final FolderRepository folderRepository;
    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final GridFsTemplate gridFsTemplate;

    // Nghiệp vụ 1: Tạo thư mục mới
    @Transactional
    public Map<String, Object> createFolder(CreateFolderRequest request, Long teacherId) {
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thông tin Giáo viên"));

        Folder parentFolder = null;
        if (request.getParentId() != null) {
            parentFolder = folderRepository.findById(request.getParentId())
                    .orElseThrow(() -> new IllegalArgumentException("Thư mục cha không tồn tại!"));
            if (!parentFolder.getTeacher().getId().equals(teacherId)) {
                throw new IllegalStateException("Bạn không có quyền tạo thư mục con trong thư mục của người khác!");
            }
        }

        if (folderRepository.existsByTeacherIdAndNameAndParentId(teacherId, request.getName(), request.getParentId())) {
            throw new IllegalArgumentException("Tên thư mục này đã tồn tại ở đây!");
        }

        Folder newFolder = Folder.builder()
                .name(request.getName())
                .teacher(teacher)
                .parent(parentFolder)
                .build();

        folderRepository.save(newFolder);

        return Map.of(
                "message", "Tạo thư mục thành công!",
                "folderId", newFolder.getId(),
                "name", newFolder.getName());
    }

    // Nghiệp vụ 2: Tải file PDF đề thi / lời giải lên hệ thống
    @Transactional
    public Map<String, Object> uploadDocument(MultipartFile file, Long folderId, String fileTypeStr, Boolean isDepartmentMaterial, Long teacherId)
            throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Vui lòng chọn file PDF để tải lên!");
        }

        // Kiểm tra định dạng bắt buộc phải là PDF
        if (!Objects.requireNonNull(file.getOriginalFilename()).toLowerCase().endsWith(".pdf")) {
            throw new IllegalArgumentException("Hệ thống chỉ chấp nhận file định dạng PDF!");
        }

        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thông tin Giáo viên"));

        if (Boolean.TRUE.equals(isDepartmentMaterial) && teacher.getRole() != User.Role.DEPARTMENT_HEAD) {
            throw new IllegalStateException("Chỉ Trưởng bộ môn mới có quyền đánh dấu tài liệu dùng chung!");
        }

        Folder folder = null;
        if (folderId != null) {
            folder = folderRepository.findById(folderId)
                    .orElseThrow(() -> new IllegalArgumentException("Thư mục lưu trữ không tồn tại!"));
            if (!folder.getTeacher().getId().equals(teacherId)) {
                throw new IllegalStateException("Bạn không có quyền tải file vào thư mục này!");
            }
        }

        Document.FileType fileType;
        try {
            fileType = Document.FileType.valueOf(fileTypeStr.toUpperCase());
        } catch (Exception e) {
            throw new IllegalArgumentException("Loại file không hợp lệ! (Chỉ nhận EXAM hoặc EXPLANATION)");
        }

        String originalFileName = file.getOriginalFilename();

        // Lưu file vào MongoDB GridFS
        ObjectId objectId = gridFsTemplate.store(file.getInputStream(), originalFileName, file.getContentType());

        // [FIX URL] Lưu fileUrl dưới dạng HTTP endpoint của API xem file mới tạo
        String fileUrl = "/api/v1/repository/documents/view/" + objectId.toString();

        // Lưu thông tin Metadata vào MySQL
        Document document = Document.builder()
                .title(originalFileName)
                .fileUrl(fileUrl)
                .fileType(fileType)
                .fileSizeKb(file.getSize() / 1024)
                .teacher(teacher)
                .folder(folder)
                .isDepartmentMaterial(Boolean.TRUE.equals(isDepartmentMaterial))
                .build();

        documentRepository.save(document);

        return Map.of(
                "message", "Tải file PDF lên thành công!",
                "documentId", document.getId(),
                "title", document.getTitle(),
                "fileSizeKb", document.getFileSizeKb(),
                "fileUrl", document.getFileUrl());
    }

    // Nghiệp vụ 3: Lấy danh sách tài nguyên (Folder + File PDF) trong 1 thư mục để
    // hiển thị lên UI
    public Map<String, Object> getRepositoryContent(Long folderId, Long teacherId) {
        List<Folder> folders;
        List<Document> documents;

        if (folderId == null) {
            // Lấy ở thư mục gốc Root
            folders = folderRepository.findAllByTeacherIdAndParentIsNull(teacherId);
            documents = documentRepository.findAllByTeacherIdAndFolderIsNull(teacherId);
        } else {
            // Lấy trong thư mục con
            folders = folderRepository.findAllByTeacherIdAndParentId(teacherId, folderId);
            documents = documentRepository.findAllByTeacherIdAndFolderId(teacherId, folderId);
        }

        List<Map<String, Object>> folderList = folders.stream().map(f -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", f.getId());
            map.put("name", f.getName());
            map.put("createdAt", f.getCreatedAt() != null ? f.getCreatedAt().toString() : null);
            map.put("type", "FOLDER");
            return map;
        }).toList();

        List<Map<String, Object>> docList = documents.stream().map(d -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", d.getId());
            map.put("title", d.getTitle());
            map.put("fileType", d.getFileType().name());
            map.put("fileSizeKb", d.getFileSizeKb());
            map.put("fileUrl", d.getFileUrl());
            map.put("createdAt", d.getCreatedAt() != null ? d.getCreatedAt().toString() : null);
            map.put("type", "FILE");
            return map;
        }).toList();

        return Map.of(
                "currentFolderId", folderId != null ? folderId : "ROOT",
                "folders", folderList,
                "documents", docList);
    }

    // Nghiệp vụ 4: Di chuyển file PDF sang thư mục khác
    @Transactional
    public Map<String, Object> moveDocument(Long documentId, Long targetFolderId, Long teacherId) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException("File tài liệu không tồn tại!"));

        if (document.getFileType() == Document.FileType.SHARED_MATERIAL) {
            throw new IllegalStateException("Không thể di chuyển tài liệu dùng chung của hệ thống!");
        }

        if (document.getTeacher() == null || !document.getTeacher().getId().equals(teacherId)) {
            throw new IllegalStateException("Bạn không có quyền di chuyển file này!");
        }

        Folder targetFolder = null;
        if (targetFolderId != null) {
            targetFolder = folderRepository.findById(targetFolderId)
                    .orElseThrow(() -> new IllegalArgumentException("Thư mục đích không tồn tại!"));
            if (!targetFolder.getTeacher().getId().equals(teacherId)) {
                throw new IllegalStateException("Bạn không có quyền di chuyển file vào thư mục người khác!");
            }
        }

        document.setFolder(targetFolder);
        documentRepository.save(document);

        return Map.of(
                "message", "Di chuyển file thành công!",
                "documentId", document.getId(),
                "targetFolderId", targetFolderId != null ? targetFolderId : "ROOT");
    }

    // Nghiệp vụ 5: Lấy toàn bộ thư mục của Giáo viên để phục vụ dropdown chọn thư mục đích
    public List<Map<String, Object>> getAllFolders(Long teacherId) {
        List<Folder> folders = folderRepository.findAllByTeacherId(teacherId);
        return folders.stream().map(f -> Map.<String, Object>of(
                "id", f.getId(),
                "name", f.getName())).toList();
    }

    // Nghiệp vụ 6: Đổi tên File PDF
    @Transactional
    public Map<String, Object> renameDocument(Long documentId, String newTitle, Long teacherId) {
        if (newTitle == null || newTitle.trim().isEmpty()) {
            throw new IllegalArgumentException("Tên file không được để trống!");
        }

        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException("File tài liệu không tồn tại!"));

        if (document.getFileType() == Document.FileType.SHARED_MATERIAL) {
            throw new IllegalStateException("Không thể đổi tên tài liệu dùng chung của hệ thống!");
        }

        if (document.getTeacher() == null || !document.getTeacher().getId().equals(teacherId)) {
            throw new IllegalStateException("Bạn không có quyền đổi tên file này!");
        }

        String cleanTitle = newTitle.trim();
        if (!cleanTitle.toLowerCase().endsWith(".pdf")) {
            cleanTitle += ".pdf";
        }

        document.setTitle(cleanTitle);
        documentRepository.save(document);

        return Map.of("message", "Đổi tên file thành công!", "documentId", documentId, "title", cleanTitle);
    }

    // Nghiệp vụ 7: Xóa File PDF (Bao gồm file vật lý)
    @Transactional
    public Map<String, Object> deleteDocument(Long documentId, Long teacherId) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException("File tài liệu không tồn tại!"));

        if (document.getFileType() == Document.FileType.SHARED_MATERIAL) {
            throw new IllegalStateException("Giáo viên không có quyền xóa tài liệu dùng chung của hệ thống!");
        }

        if (document.getTeacher() == null || !document.getTeacher().getId().equals(teacherId)) {
            throw new IllegalStateException("Bạn không có quyền xóa file này!");
        }

        try {
            if (document.getFileUrl() != null && document.getFileUrl().contains("/api/v1/repository/documents/view/")) {
                String gridFsId = document.getFileUrl().substring(document.getFileUrl().lastIndexOf("/") + 1);
                gridFsTemplate.delete(new Query(Criteria.where("_id").is(gridFsId)));
            }
        } catch (Exception e) {
            System.err.println("Lỗi khi xóa file: " + e.getMessage());
        }

        documentRepository.delete(document);
        return Map.of("message", "Xóa tài liệu thành công!", "documentId", documentId);
    }

    // Nghiệp vụ 8: Đổi tên Thư Mục
    @Transactional
    public Map<String, Object> renameFolder(Long folderId, String newName, Long teacherId) {
        if (newName == null || newName.trim().isEmpty()) {
            throw new IllegalArgumentException("Tên thư mục không được để trống!");
        }

        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new IllegalArgumentException("Thư mục không tồn tại!"));

        if (!folder.getTeacher().getId().equals(teacherId)) {
            throw new IllegalStateException("Bạn không có quyền đổi tên thư mục này!");
        }

        folder.setName(newName.trim());
        folderRepository.save(folder);

        return Map.of("message", "Đổi tên thư mục thành công!", "folderId", folderId, "name", folder.getName());
    }

    // Nghiệp vụ 9: Xóa Thư Mục (Dọn sạch cả file trong thư mục)
    @Transactional
    public Map<String, Object> deleteFolder(Long folderId, Long teacherId) {
        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new IllegalArgumentException("Thư mục không tồn tại!"));

        if (!folder.getTeacher().getId().equals(teacherId)) {
            throw new IllegalStateException("Bạn không có quyền xóa thư mục này!");
        }

        List<Document> docs = documentRepository.findAllByTeacherIdAndFolderId(teacherId, folderId);
        for (Document doc : docs) {
            try {
                if (doc.getFileUrl() != null && doc.getFileUrl().contains("/api/v1/repository/documents/view/")) {
                    String gridFsId = doc.getFileUrl().substring(doc.getFileUrl().lastIndexOf("/") + 1);
                    gridFsTemplate.delete(new Query(Criteria.where("_id").is(gridFsId)));
                } else if (doc.getFileUrl() != null && doc.getFileUrl().startsWith("/api/v1/files/")) {
                    String fileName = doc.getFileUrl().replace("/api/v1/files/", "");
                    Path path = Paths.get("local-storage/uploads/" + fileName);
                    Files.deleteIfExists(path);
                }
            } catch (Exception e) {
                System.err.println("Lỗi khi xóa file: " + e.getMessage());
            }
            documentRepository.delete(doc);
        }

        folderRepository.delete(folder);
        return Map.of("message", "Xóa thư mục thành công!", "folderId", folderId);
    }

    // Nghiệp vụ 10: Đổi loại File (Đề Thi <-> Lời Giải)
    @Transactional
    public Map<String, Object> toggleFileType(Long documentId, Long teacherId) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException("File tài liệu không tồn tại!"));

        if (document.getFileType() == Document.FileType.SHARED_MATERIAL) {
            throw new IllegalStateException("Không thể đổi loại tài liệu dùng chung của hệ thống!");
        }

        if (document.getTeacher() == null || !document.getTeacher().getId().equals(teacherId)) {
            throw new IllegalStateException("Bạn không có quyền thay đổi file này!");
        }

        Document.FileType currentType = document.getFileType();
        Document.FileType newType = (currentType != null && currentType == Document.FileType.EXAM)
                ? Document.FileType.EXPLANATION
                : Document.FileType.EXAM;

        document.setFileType(newType);
        documentRepository.save(document);

        Map<String, Object> result = new HashMap<>();
        result.put("message", "Đổi loại file thành công!");
        result.put("documentId", documentId);
        result.put("fileType", newType.name());
        return result;
    }

    // Nghiệp vụ 11: Lấy tài liệu dùng chung theo Tổ bộ môn của Giáo viên
    public Map<String, Object> getSharedDepartmentDocuments(Long teacherId) {
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thông tin Giáo viên"));

        List<Document> documents;
        String deptName = "Chưa phân tổ";
        Long deptId = null;

        if (teacher.getDepartment() != null) {
            deptId = teacher.getDepartment().getId();
            deptName = teacher.getDepartment().getName();
            // Lấy tài liệu thuộc tổ của GV hoặc tài liệu chung toàn trường (department == null)
            documents = documentRepository.findAllByFileTypeAndDepartmentIdOrFileTypeAndDepartmentIsNullOrderByIdDesc(
                    Document.FileType.SHARED_MATERIAL, deptId,
                    Document.FileType.SHARED_MATERIAL);
        } else {
            // Nếu GV chưa phân tổ, lấy toàn bộ tài liệu chung
            documents = documentRepository.findAllByFileTypeOrderByIdDesc(Document.FileType.SHARED_MATERIAL);
        }

        java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy");

        List<Map<String, Object>> docList = documents.stream().map(d -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", d.getId());
            map.put("title", d.getTitle());
            map.put("fileType", d.getFileType().name());
            
            // Định dạng mở rộng
            String ext = "UNKNOWN";
            if (d.getTitle() != null && d.getTitle().contains(".")) {
                ext = d.getTitle().substring(d.getTitle().lastIndexOf(".") + 1).toUpperCase();
            }
            map.put("format", ext);
            
            double sizeMb = d.getFileSizeKb() / 1024.0;
            if (sizeMb >= 1.0) {
                map.put("size", String.format("%.1f MB", sizeMb));
            } else {
                map.put("size", d.getFileSizeKb() + " KB");
            }
            
            map.put("fileSizeKb", d.getFileSizeKb());
            map.put("fileUrl", d.getFileUrl());
            map.put("uploadedDate", d.getCreatedAt() != null ? d.getCreatedAt().format(formatter) : "");
            map.put("uploadedBy", d.getTeacher() != null ? d.getTeacher().getFullName() : "Quản lý trung tâm");
            map.put("departmentName", d.getDepartment() != null ? d.getDepartment().getName() : "Tất cả bộ môn");
            map.put("type", "SHARED_FILE");
            return map;
        }).toList();

        Map<String, Object> response = new HashMap<>();
        response.put("departmentId", deptId);
        response.put("departmentName", deptName);
        response.put("documents", docList);
        return response;
    }
}