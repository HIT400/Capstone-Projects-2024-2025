package com.capstone.practice_pal_engine.controllers;

import com.capstone.practice_pal_engine.dto.response.PracticePalResponse;
import com.capstone.practice_pal_engine.dto.response.StudentDashboard;
import com.capstone.practice_pal_engine.models.User;
import com.capstone.practice_pal_engine.services.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/v1/student")
@RequiredArgsConstructor
public class StudentController {
    private final StudentService service;

    @GetMapping
    public ResponseEntity<PracticePalResponse> get() {
        return ResponseEntity.ok(new PracticePalResponse("User details fetched successfully", service.getStudent()));
    }

    @GetMapping(value = "/dashboard")
    public ResponseEntity<PracticePalResponse> dashboard() {
        return ResponseEntity.ok(new PracticePalResponse("User dashboard fetched successfully", service.getDashboard()));
    }

}
