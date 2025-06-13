package com.capstone.practice_pal_engine.implementations;

import com.capstone.practice_pal_engine.deepseek.DeepSeekClient;
import com.capstone.practice_pal_engine.deepseek.DeepSeekModels;
import com.capstone.practice_pal_engine.dto.requests.CourseRequest;
import com.capstone.practice_pal_engine.dto.response.CourseAIResponse;
import com.capstone.practice_pal_engine.models.Course;
import com.capstone.practice_pal_engine.models.Topic;
import com.capstone.practice_pal_engine.models.User;
import com.capstone.practice_pal_engine.repositories.CourseRepository;
import com.capstone.practice_pal_engine.services.CourseService;
import com.capstone.practice_pal_engine.utils.PracticePalConstants;
import com.capstone.practice_pal_engine.utils.PromptGenerator;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class CourseServiceImpl implements CourseService {

    private final CourseRepository repository;
    private final ChatClient chatClient;

    @Override
    public Course createCourse(CourseRequest request) {
        var prompt = PromptGenerator.coursePrompt(request.getCourseName(), request.getLevel().toString());
        var courseResponse = chatClient
                .prompt()
                .user(prompt)
                .call()
                .entity(CourseAIResponse.class);
        System.out.println(courseResponse);

        List<Topic> topics = new ArrayList<>();
        for (int i = 1; i <= Objects.requireNonNull(courseResponse).topics().size(); i++) {
            topics.add(new Topic(i, courseResponse.topics().get(i - 1)));
        }

        User user = (User) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        var course = Course.builder()
                .title(courseResponse.title())
                .category(courseResponse.category())
                .description(courseResponse.description())
                .level(request.getLevel())
                .topics(topics)
                .user(user)
                .build();
        return repository.save(course);

    }

    @Override
    public Course createCustomCourse(Course request) {
        User user = (User) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        var course = Course.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .level(request.getLevel())
                .topics(request.getTopics())
                .user(user)
                .build();
        return repository.save(course);
    }

    @Override
    @Transactional
    public List<Course> getAllCourses() {
        User user = (User) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();
        return repository.findByUser(user);
    }

    @Override
    @Transactional
    public Course getCourse(Long id) {
        User user = (User) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();
        return repository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course was not found"));
    }

    @Override
    @Transactional
    public String deleteCourse(Long id) {
        User user = (User) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();
        Course course = repository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course was not found"));
        repository.delete(course);
        return course.getTitle() + " was deleted successfully";
    }

    @Override
    @Transactional
    public Course updateCourse(Course request) {
        User user = (User) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();
        repository.findByIdAndUser(request.getId(), user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course was not found"));

        var course = Course.builder()
                .id(request.getId())
                .title(request.getTitle())
                .description(request.getDescription())
                .level(request.getLevel())
                .topics(request.getTopics())
                .user(user)
                .build();
        return repository.saveAndFlush(course);
    }

}
