package com.capstone.practice_pal_engine.implementations;

import com.capstone.practice_pal_engine.dto.response.StudentDashboard;
import com.capstone.practice_pal_engine.models.Test;
import com.capstone.practice_pal_engine.models.TestResults;
import com.capstone.practice_pal_engine.models.User;
import com.capstone.practice_pal_engine.repositories.CourseRepository;
import com.capstone.practice_pal_engine.repositories.TestRepository;
import com.capstone.practice_pal_engine.repositories.TestResultsRepository;
import com.capstone.practice_pal_engine.repositories.UserRepository;
import com.capstone.practice_pal_engine.services.StudentService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StudentServiceImpl implements StudentService {
    private final UserRepository repository;
    private final CourseRepository courseRepository;
    private final TestRepository testRepository;
    private final TestResultsRepository resultsRepository;

    @Override
    public User getStudent() {
        User user = (User) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();
        return repository.findById(user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found!"));
    }

    @Override
    @Transactional
    public StudentDashboard getDashboard() {
        User user = (User) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        var results = resultsRepository.findByUser(user);
        results.sort((o1, o2) -> o2.getDate().compareTo(o1.getDate()));
        var avgScore = results.stream().map(TestResults::getScore).mapToDouble(BigDecimal::doubleValue).average();

        var tests = testRepository.findByUser(user);
        var courses = courseRepository.findByUser(user);

        List<Map<String, Object>> courseAverages = new ArrayList<>();
        for (var course : courses) {
            var courseTests = course.getTests();
            var courseTestResults = courseTests.stream().flatMap(test -> test.getResults().stream());
            var average = courseTestResults.mapToDouble(result -> result.getScore().doubleValue()).average();
            System.out.println(average);

            Map<String, Object> map = new HashMap<>();
            map.put("course", course.getTitle());
            map.put("average", average);
            courseAverages.add(map);
        }

        return StudentDashboard.builder()
                .studentName(user.getFullName())
                .noOfCourses(courses.size())
                .noOfTests(tests.size())
                .avgScore(avgScore.isPresent() ? avgScore.getAsDouble() : 0)
                .recentTestResults(results.size() > 5 ? results.subList(0, 5) : results)
                .courseAverages(courseAverages)
                .build();
    }


}
