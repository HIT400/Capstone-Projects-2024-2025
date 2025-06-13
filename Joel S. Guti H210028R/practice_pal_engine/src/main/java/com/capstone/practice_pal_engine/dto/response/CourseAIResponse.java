package com.capstone.practice_pal_engine.dto.response;

import com.capstone.practice_pal_engine.models.Topic;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record CourseAIResponse(String title, String description, String category, List<String> topics) {
}
