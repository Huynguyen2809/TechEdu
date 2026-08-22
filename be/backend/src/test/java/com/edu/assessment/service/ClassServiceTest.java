package com.edu.assessment.service;

import com.edu.assessment.dto.request.CreateClassRequest;
import com.edu.assessment.entity.Class;
import com.edu.assessment.entity.User;
import com.edu.assessment.repository.ClassMemberRepository;
import com.edu.assessment.repository.ClassRepository;
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
class ClassServiceTest {

    @Mock
    private ClassRepository classRepository;

    @Mock
    private ClassMemberRepository classMemberRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ClassService classService;

    private User teacher;

    @BeforeEach
    void setUp() {
        teacher = User.builder()
                .id(1L)
                .fullName("Teacher Test")
                .phoneNumber("0981112233")
                .role(User.Role.TEACHER)
                .build();
    }

    @Test
    void testCreateClass_Success() {
        CreateClassRequest request = new CreateClassRequest();
        request.setName("Lop 12A1");
        request.setSubjectName("Toan");
        request.setGradeLevel(12);

        when(userRepository.findById(1L)).thenReturn(Optional.of(teacher));
        when(classRepository.existsByJoinCode(anyString())).thenReturn(false);
        when(classRepository.save(any(Class.class))).thenAnswer(invocation -> {
            Class c = invocation.getArgument(0);
            c.setId(100L);
            return c;
        });

        Map<String, Object> response = classService.createClass(request, 1L);

        assertNotNull(response);
        assertEquals("Tạo lớp học thành công!", response.get("message"));
        assertEquals("Lop 12A1", response.get("name"));
        verify(classRepository, times(1)).save(any(Class.class));
    }

    @Test
    void testCreateClass_NotTeacher_ThrowsException() {
        User student = User.builder()
                .id(2L)
                .role(User.Role.STUDENT)
                .build();

        CreateClassRequest request = new CreateClassRequest();
        request.setName("Lop 12A1");

        when(userRepository.findById(2L)).thenReturn(Optional.of(student));

        Exception exception = assertThrows(IllegalStateException.class, () -> {
            classService.createClass(request, 2L);
        });

        assertTrue(exception.getMessage().contains("Chỉ Giáo viên mới có quyền tạo lớp học"));
    }
}
