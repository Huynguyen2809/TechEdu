package com.edu.assessment.controller;

import com.edu.assessment.dto.request.CreateFolderRequest;
import com.edu.assessment.service.RepositoryService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Criteria;
import com.mongodb.client.gridfs.model.GridFSFile;
import org.springframework.data.mongodb.gridfs.GridFsResource;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/repository")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('TEACHER', 'CENTER_MANAGER', 'DEPARTMENT_HEAD')") // <-- Chỉ Giáo viên/Center Manager mới vào được Ngân hàng đề
public class RepositoryController {

    private final RepositoryService repositoryService;
    private final GridFsTemplate gridFsTemplate;

    private Long getCurrentUserId(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("USER_ID") == null) {
            throw new IllegalStateException("Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn!");
        }
        return (Long) session.getAttribute("USER_ID");
    }

    // 1. API Tạo thư mục mới
    @PostMapping("/folders")
    public ResponseEntity<?> createFolder(@Valid @RequestBody CreateFolderRequest request, HttpServletRequest httpServletRequest) {
        Long teacherId = getCurrentUserId(httpServletRequest);
        return ResponseEntity.ok(repositoryService.createFolder(request, teacherId));
    }

    // 2. API Tải file PDF lên (Sử dụng multipart/form-data)
    @PostMapping("/upload")
    public ResponseEntity<?> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folderId", required = false) Long folderId,
            @RequestParam("fileType") String fileType,
            HttpServletRequest httpServletRequest) throws Exception {
        Long teacherId = getCurrentUserId(httpServletRequest);
        return ResponseEntity.ok(repositoryService.uploadDocument(file, folderId, fileType, teacherId));
    }

    // 3. API Lấy danh sách Folder và File (Khám phá kho đề)
    @GetMapping("/content")
    public ResponseEntity<?> getRepositoryContent(
            @RequestParam(value = "folderId", required = false) Long folderId,
            HttpServletRequest httpServletRequest) {
        Long teacherId = getCurrentUserId(httpServletRequest);
        return ResponseEntity.ok(repositoryService.getRepositoryContent(folderId, teacherId));
    }

    // 4. API Di chuyển file sang thư mục khác (Hỗ trợ cả PUT và POST)
    @RequestMapping(value = {"/documents/{documentId}/move", "/documents/move"}, method = {RequestMethod.PUT, RequestMethod.POST})
    public ResponseEntity<?> moveDocument(
            @PathVariable(value = "documentId", required = false) Long pathDocId,
            @RequestBody(required = false) Map<String, Object> body,
            @RequestParam(value = "documentId", required = false) Long paramDocId,
            @RequestParam(value = "targetFolderId", required = false) Long paramTargetFolderId,
            HttpServletRequest httpServletRequest) {
        Long teacherId = getCurrentUserId(httpServletRequest);

        Long documentId = pathDocId != null ? pathDocId : paramDocId;
        if (documentId == null && body != null && body.get("documentId") != null) {
            documentId = Long.valueOf(body.get("documentId").toString());
        }

        if (documentId == null) {
            throw new IllegalArgumentException("Thiếu documentId!");
        }

        Long targetFolderId = paramTargetFolderId;
        if (targetFolderId == null && body != null && body.get("targetFolderId") != null) {
            String val = body.get("targetFolderId").toString();
            if (!val.isEmpty() && !"null".equalsIgnoreCase(val) && !"ROOT".equalsIgnoreCase(val)) {
                targetFolderId = Long.valueOf(val);
            }
        }

        return ResponseEntity.ok(repositoryService.moveDocument(documentId, targetFolderId, teacherId));
    }

    // 5. API Lấy danh sách tất cả thư mục của giáo viên (để chuyển file)
    @GetMapping("/folders/all")
    public ResponseEntity<?> getAllFolders(HttpServletRequest httpServletRequest) {
        Long teacherId = getCurrentUserId(httpServletRequest);
        return ResponseEntity.ok(repositoryService.getAllFolders(teacherId));
    }

    // 6. API Đổi tên File PDF (Hỗ trợ cả PUT và POST)
    @RequestMapping(value = {"/documents/{documentId}/rename", "/documents/rename"}, method = {RequestMethod.PUT, RequestMethod.POST})
    public ResponseEntity<?> renameDocument(
            @PathVariable(value = "documentId", required = false) Long pathDocId,
            @RequestBody(required = false) Map<String, Object> body,
            @RequestParam(value = "documentId", required = false) Long paramDocId,
            HttpServletRequest httpServletRequest) {
        Long teacherId = getCurrentUserId(httpServletRequest);
        Long documentId = pathDocId != null ? pathDocId : paramDocId;
        if (documentId == null && body != null && body.get("documentId") != null) {
            documentId = Long.valueOf(body.get("documentId").toString());
        }
        String title = body != null && body.get("title") != null ? body.get("title").toString() : null;
        return ResponseEntity.ok(repositoryService.renameDocument(documentId, title, teacherId));
    }

    // 7. API Xóa File PDF (Hỗ trợ cả DELETE, POST, và GET)
    @RequestMapping(value = {"/documents/{documentId}", "/documents/{documentId}/delete", "/documents/delete"}, method = {RequestMethod.DELETE, RequestMethod.POST, RequestMethod.GET})
    public ResponseEntity<?> deleteDocument(
            @PathVariable(value = "documentId", required = false) Long pathDocId,
            @RequestParam(value = "documentId", required = false) Long paramDocId,
            HttpServletRequest httpServletRequest) {
        Long teacherId = getCurrentUserId(httpServletRequest);
        Long documentId = pathDocId != null ? pathDocId : paramDocId;
        return ResponseEntity.ok(repositoryService.deleteDocument(documentId, teacherId));
    }

    // 8. API Đổi tên Thư Mục (Hỗ trợ cả PUT và POST)
    @RequestMapping(value = {"/folders/{folderId}/rename", "/folders/rename"}, method = {RequestMethod.PUT, RequestMethod.POST})
    public ResponseEntity<?> renameFolder(
            @PathVariable(value = "folderId", required = false) Long pathFolderId,
            @RequestBody(required = false) Map<String, Object> body,
            @RequestParam(value = "folderId", required = false) Long paramFolderId,
            HttpServletRequest httpServletRequest) {
        Long teacherId = getCurrentUserId(httpServletRequest);
        Long folderId = pathFolderId != null ? pathFolderId : paramFolderId;
        if (folderId == null && body != null && body.get("folderId") != null) {
            folderId = Long.valueOf(body.get("folderId").toString());
        }
        String name = body != null && body.get("name") != null ? body.get("name").toString() : null;
        return ResponseEntity.ok(repositoryService.renameFolder(folderId, name, teacherId));
    }

    // 9. API Xóa Thư Mục (Hỗ trợ cả DELETE, POST, và GET)
    @RequestMapping(value = {"/folders/{folderId}", "/folders/{folderId}/delete", "/folders/delete"}, method = {RequestMethod.DELETE, RequestMethod.POST, RequestMethod.GET})
    public ResponseEntity<?> deleteFolder(
            @PathVariable(value = "folderId", required = false) Long pathFolderId,
            @RequestParam(value = "folderId", required = false) Long paramFolderId,
            HttpServletRequest httpServletRequest) {
        Long teacherId = getCurrentUserId(httpServletRequest);
        Long folderId = pathFolderId != null ? pathFolderId : paramFolderId;
        return ResponseEntity.ok(repositoryService.deleteFolder(folderId, teacherId));
    }

    // 10. API Chuyển đổi loại file (Đề Thi <-> Lời Giải)
    @RequestMapping(value = {"/documents/{documentId}/toggle-type", "/documents/toggle-type"}, method = {RequestMethod.PUT, RequestMethod.POST, RequestMethod.GET})
    public ResponseEntity<?> toggleFileType(
            @PathVariable(value = "documentId", required = false) Long pathDocId,
            @RequestParam(value = "documentId", required = false) Long paramDocId,
            HttpServletRequest httpServletRequest) {
        Long teacherId = getCurrentUserId(httpServletRequest);
        Long documentId = pathDocId != null ? pathDocId : paramDocId;
        if (documentId == null) {
            throw new IllegalArgumentException("Thiếu documentId!");
        }
        return ResponseEntity.ok(repositoryService.toggleFileType(documentId, teacherId));
    }

    // 11. API Xem file PDF trực tiếp từ GridFS
    @GetMapping("/documents/view/{fileId}")
    @PreAuthorize("permitAll()") // Tuỳ chỉnh phân quyền nếu cần
    public ResponseEntity<InputStreamResource> viewDocument(@PathVariable String fileId) {
        try {
            GridFSFile gridFSFile = gridFsTemplate.findOne(new Query(Criteria.where("_id").is(fileId)));
            if (gridFSFile == null) {
                return ResponseEntity.notFound().build();
            }

            GridFsResource resource = gridFsTemplate.getResource(gridFSFile);
            
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + gridFSFile.getFilename() + "\"")
                    .body(new InputStreamResource(resource.getInputStream()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}