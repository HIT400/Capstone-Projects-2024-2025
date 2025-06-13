package com.capstone.practice_pal_engine.dto.requests;

import com.capstone.practice_pal_engine.models.QuestionResponse;
import lombok.Data;

import java.util.List;

@Data
public class TakeTestRequest {
    private Long testId;
    private List<QuestionResponse> responses;
}
