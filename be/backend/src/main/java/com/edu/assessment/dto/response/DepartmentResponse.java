package com.edu.assessment.dto.response;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class DepartmentResponse {
    private Long id;
    private String name;
    private Long headId;
    private String headName;
    private Integer teacherCount;
}
