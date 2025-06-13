package com.capstone.practice_pal_engine.controllers;

import com.capstone.practice_pal_engine.dto.requests.CourseRequest;
import com.capstone.practice_pal_engine.dto.response.PracticePalResponse;
import com.capstone.practice_pal_engine.models.Course;
import com.capstone.practice_pal_engine.services.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/course")
public class CourseController {
    private final CourseService service;

    @GetMapping("/all")
    public ResponseEntity<PracticePalResponse> all() {
        return ResponseEntity.ok(new PracticePalResponse("Fetched all courses successfully", service.getAllCourses()));
    }

    @PostMapping("/create")
    public ResponseEntity<PracticePalResponse> create(@RequestBody CourseRequest request) {
        return ResponseEntity.ok(new PracticePalResponse("Created new course successfully", service.createCourse(request)));
    }

    @PostMapping("/custom")
    public ResponseEntity<PracticePalResponse> custom(@RequestBody Course request) {
        return ResponseEntity.ok(new PracticePalResponse("Created custom course successfully", service.createCustomCourse(request)));
    }

    @DeleteMapping("/delete")
    public ResponseEntity<PracticePalResponse> delete(@RequestParam Long courseId) {
        return ResponseEntity.ok(new PracticePalResponse("Deleted course successfully", service.deleteCourse(courseId)));
    }

    @GetMapping("/{courseId}")
    public ResponseEntity<PracticePalResponse> getCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(new PracticePalResponse("Fetched course successfully", service.getCourse(courseId)));
    }

    @PutMapping("/update")
    public ResponseEntity<PracticePalResponse> update(@RequestBody Course course) {
        return ResponseEntity.ok(new PracticePalResponse("Course updated successfully", service.updateCourse(course)));
    }
}
