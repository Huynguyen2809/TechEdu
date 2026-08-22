package com.edu.assessment.service;

import com.edu.assessment.dto.request.CreateFolderRequest;
import com.edu.assessment.entity.Folder;
import com.edu.assessment.entity.User;
import com.edu.assessment.repository.DocumentRepository;
import com.edu.assessment.repository.FolderRepository;
import com.edu.assessment.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RepositoryServiceTest {

    @Mock
    private FolderRepository folderRepository;

    @Mock
    private DocumentRepository documentRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private RepositoryService repositoryService;

    private User teacher;

    @BeforeEach
    void setUp() {
        teacher = User.builder()
                .id(1L)
                .fullName("Teacher Test")
                .role(User.Role.TEACHER)
                .build();
    }

    @Test
    void testCreateFolder_Success() {
        CreateFolderRequest request = new CreateFolderRequest();
        request.setName("Thu muc De thi 2025");

        when(userRepository.findById(1L)).thenReturn(Optional.of(teacher));
        when(folderRepository.existsByTeacherIdAndNameAndParentId(1L, "Thu muc De thi 2025", null)).thenReturn(false);
        when(folderRepository.save(any(Folder.class))).thenAnswer(invocation -> {
            Folder f = invocation.getArgument(0);
            f.setId(50L);
            return f;
        });

        Map<String, Object> result = repositoryService.createFolder(request, 1L);

        assertNotNull(result);
        assertEquals("Tạo thư mục thành công!", result.get("message"));
        assertEquals("Thu muc De thi 2025", result.get("name"));
        verify(folderRepository, times(1)).save(any(Folder.class));
    }

    @Test
    void testCreateFolder_DuplicateName_ThrowsException() {
        CreateFolderRequest request = new CreateFolderRequest();
        request.setName("Thu muc De thi 2025");

        when(userRepository.findById(1L)).thenReturn(Optional.of(teacher));
        when(folderRepository.existsByTeacherIdAndNameAndParentId(1L, "Thu muc De thi 2025", null)).thenReturn(true);

        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            repositoryService.createFolder(request, 1L);
        });

        assertTrue(exception.getMessage().contains("Tên thư mục này đã tồn tại"));
    }
}
