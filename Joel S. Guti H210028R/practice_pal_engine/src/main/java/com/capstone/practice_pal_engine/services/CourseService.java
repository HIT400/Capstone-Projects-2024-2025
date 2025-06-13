package com.capstone.practice_pal_engine.services;

import com.capstone.practice_pal_engine.dto.requests.CourseRequest;
import com.capstone.practice_pal_engine.models.Course;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface CourseService {
    Course createCourse(CourseRequest request);
    Course createCustomCourse(Course request);
    List<Course> getAllCourses();
    Course getCourse(Long id);
    String deleteCourse(Long id);
    Course updateCourse(Course course);
}
