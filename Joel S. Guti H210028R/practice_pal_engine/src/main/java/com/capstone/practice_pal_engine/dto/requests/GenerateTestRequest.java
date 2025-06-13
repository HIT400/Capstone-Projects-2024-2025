package com.capstone.practice_pal_engine.dto.requests;

import com.capstone.practice_pal_engine.models.Topic;
import com.capstone.practice_pal_engine.models.enums.Difficulty;
import lombok.Data;

import java.util.List;

@Data
public class GenerateTestRequest {
    private Long courseId;
    private String testName;
    private int noOfQuestions;
    private Difficulty difficulty;
    private List<Topic> topics;
}
