package com.capstone.practice_pal_engine.services;

import com.capstone.practice_pal_engine.dto.requests.GenerateTestRequest;
import com.capstone.practice_pal_engine.dto.requests.TakeTestRequest;
import com.capstone.practice_pal_engine.dto.response.TestDetailsResponse;
import com.capstone.practice_pal_engine.models.Test;
import com.capstone.practice_pal_engine.models.TestResults;

import java.util.List;

public interface TestService {
    List<Test> getTests();
    Test getTestById(Long testId);
    List<TestResults> getAllTestResults();
    TestResults getTestResults(Long testId);
    Test generate(GenerateTestRequest request);
    Test pastPapers(GenerateTestRequest request);
    TestResults attemptTest(TakeTestRequest request);
    Object reviseTest(Long resultId);
    TestDetailsResponse getTestDetails(Long testId);
}
