package com.capstone.practice_pal_engine.dto.response;

import com.capstone.practice_pal_engine.models.TestResults;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.OptionalDouble;

@Data
@Builder
public class StudentDashboard {
    private String studentName;
    private Integer noOfTests, noOfCourses;
    private Double avgScore;
    private List<TestResults> recentTestResults;
    private List<Map<String, Object>> courseAverages;
}
