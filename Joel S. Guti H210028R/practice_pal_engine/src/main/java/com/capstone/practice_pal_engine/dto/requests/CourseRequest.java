package com.capstone.practice_pal_engine.dto.requests;

import com.capstone.practice_pal_engine.models.enums.Level;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Data;

@Data
public class CourseRequest {
    private String courseName;

    @Enumerated(EnumType.STRING)
    private Level level;
}
