package com.capstone.practice_pal_engine.dto.response;

import com.capstone.practice_pal_engine.models.Question;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Lob;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record TestAIResponse(List<Question> questions) {
}
