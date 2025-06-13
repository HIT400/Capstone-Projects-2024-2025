package com.capstone.practice_pal_engine.controllers;

import com.capstone.practice_pal_engine.dto.requests.GenerateTestRequest;
import com.capstone.practice_pal_engine.dto.requests.TakeTestRequest;
import com.capstone.practice_pal_engine.dto.response.PracticePalResponse;
import com.capstone.practice_pal_engine.services.TestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/v1/test")
public class TestController {
    private final TestService service;

    @GetMapping("/all")
    public ResponseEntity<PracticePalResponse> getAllTests() {
        return ResponseEntity.ok(new PracticePalResponse("Fetched all tests successfully", service.getTests()));
    }

    @GetMapping("/{testId}")
    public ResponseEntity<PracticePalResponse> getTest(@PathVariable Long testId) {
        return ResponseEntity.ok(new PracticePalResponse("Fetched test successfully", service.getTestById(testId)));
    }

    @GetMapping("/{testId}/details")
    public ResponseEntity<PracticePalResponse> getTestDetails(@PathVariable Long testId) {
        return ResponseEntity.ok(new PracticePalResponse("Fetched test details successfully", service.getTestDetails(testId)));
    }

    @GetMapping("/results")
    public ResponseEntity<PracticePalResponse> getAllResults() {
        return ResponseEntity.ok(new PracticePalResponse("Fetched test results successfully", service.getAllTestResults()));
    }

    @GetMapping("/result/{resultId}")
    public ResponseEntity<PracticePalResponse> getTestResults(@PathVariable Long resultId) {
        return ResponseEntity.ok(new PracticePalResponse("Fetched test results successfully", service.getTestResults(resultId)));
    }

    @PostMapping("/generate")
    public ResponseEntity<PracticePalResponse> generateTest(@RequestBody GenerateTestRequest request) {
        return ResponseEntity.ok(new PracticePalResponse("Generated new test successfully", service.generate(request)));
    }

    @PostMapping("/past")
    public ResponseEntity<PracticePalResponse> generatePastTests(@RequestBody GenerateTestRequest request) {
        return ResponseEntity.ok(new PracticePalResponse("Generated test from past tests successfully", service.pastPapers(request)));
    }

    @PostMapping("/attempt")
    public ResponseEntity<PracticePalResponse> takeTest(@RequestBody TakeTestRequest request) {
        return ResponseEntity.ok(new PracticePalResponse("Test taken successfully", service.attemptTest(request)));
    }

    @GetMapping("/revision/{resultId}")
    public ResponseEntity<PracticePalResponse> reviseTest(@PathVariable Long resultId) {
        return ResponseEntity.ok(new PracticePalResponse("Test taken successfully", service.reviseTest(resultId)));
    }
}
