package com.capstone.practice_pal_engine.dto.response;

import com.capstone.practice_pal_engine.models.TestResults;
import com.capstone.practice_pal_engine.models.enums.Difficulty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TestDetailsResponse {
    private Long id;
    private String title;
    private Difficulty difficulty;
    private Date createdAt;
    private List<TestResults> results;
}
