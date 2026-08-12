package com.edu.assessment.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    private long totalStaff;
    private long totalTeachers;
    private long totalStudents;
    private long totalDepartments;
    private long totalSharedDocuments;
    private long totalClasses;
    private long totalExams;
    private long totalSubmissions;
}
