package com.edu.assessment.service;

import com.edu.assessment.entity.Document;
import com.edu.assessment.entity.User;
import com.edu.assessment.repository.DocumentRepository;
import com.edu.assessment.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CenterDocumentService {

    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final GridFsTemplate gridFsTemplate;

    public List<Map<String, Object>> getAllSharedDocuments() {
        List<Document> documents = documentRepository.findAllByFileTypeOrderByIdDesc(Document.FileType.SHARED_MATERIAL);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");

        return documents.stream().map(doc -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", doc.getId());
            map.put("name", doc.getTitle());
            
            // Lấy định dạng file từ tên gốc hoặc fileUrl nếu có (do ta chỉ lưu loại file chung là SHARED_MATERIAL)
            String fileType = "UNKNOWN";
            if (doc.getTitle() != null && doc.getTitle().contains(".")) {
                fileType = doc.getTitle().substring(doc.getTitle().lastIndexOf(".") + 1).toUpperCase();
            }
            map.put("fileType", fileType);
            
            // Hiển thị dung lượng
            double sizeMb = doc.getFileSizeKb() / 1024.0;
            if (sizeMb >= 1.0) {
                map.put("size", String.format("%.1f MB", sizeMb));
            } else {
                map.put("size", doc.getFileSizeKb() + " KB");
            }
            
            map.put("uploadedDate", doc.getCreatedAt() != null ? doc.getCreatedAt().format(formatter) : "");
            map.put("uploadedBy", doc.getTeacher() != null ? doc.getTeacher().getFullName() : "Giám đốc trung tâm");
            map.put("fileUrl", doc.getFileUrl());
            return map;
        }).toList();
    }

    @Transactional
    public Map<String, Object> uploadSharedDocument(MultipartFile file, String name, Long uploaderId) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Vui lòng chọn file để tải lên!");
        }

        User uploader = userRepository.findById(uploaderId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thông tin người tải lên"));

        String originalFileName = file.getOriginalFilename();
        if (originalFileName == null) {
            originalFileName = "document";
        }
        
        String ext = "";
        if (originalFileName.contains(".")) {
            ext = originalFileName.substring(originalFileName.lastIndexOf("."));
        }
        
        // Ensure name has extension if original file had one
        String title = name;
        if (!title.toLowerCase().endsWith(ext.toLowerCase()) && !ext.isEmpty()) {
            title += ext;
        }

        // Lưu file vào MongoDB GridFS
        ObjectId objectId = gridFsTemplate.store(file.getInputStream(), title, file.getContentType());

        // Lưu fileUrl dưới dạng HTTP endpoint của API xem file đã có sẵn trong RepositoryController
        String fileUrl = "/api/v1/repository/documents/view/" + objectId.toString();

        Document document = Document.builder()
                .title(title)
                .fileUrl(fileUrl)
                .fileType(Document.FileType.SHARED_MATERIAL)
                .fileSizeKb(file.getSize() / 1024)
                .teacher(uploader)
                .folder(null) // Tài liệu chung không nằm trong folder cá nhân nào
                .isDepartmentMaterial(false)
                .build();

        documentRepository.save(document);

        return Map.of(
                "message", "Tải tài liệu lên thành công!",
                "documentId", document.getId()
        );
    }

    @Transactional
    public Map<String, Object> deleteSharedDocument(Long documentId, Long uploaderId) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException("Tài liệu không tồn tại!"));

        // Có thể thêm bước kiểm tra quyền nếu cần thiết, 
        // nhưng với Center Manager thì có quyền xoá bất kỳ tài liệu chung nào
        if (document.getFileType() != Document.FileType.SHARED_MATERIAL) {
             throw new IllegalArgumentException("Không thể xoá tài liệu này từ quản lý tài liệu chung!");
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
}
