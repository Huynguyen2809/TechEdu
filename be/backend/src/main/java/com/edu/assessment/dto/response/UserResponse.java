package com.edu.assessment.dto.response;

import com.edu.assessment.entity.User;
import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class UserResponse {
    private Long id;
    private String fullName;
    private String phoneNumber;
    private User.Role role;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private Long departmentId;
    private String departmentName;
}
