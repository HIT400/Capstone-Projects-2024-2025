package com.capstone.practice_pal_engine.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReviseTest {
    private Test test;
    private List<Answer> answers;
    private int totalCorrectAnswers, totalQuestions;
}
