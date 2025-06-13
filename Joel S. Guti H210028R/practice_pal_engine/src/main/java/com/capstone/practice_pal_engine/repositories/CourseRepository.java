package com.capstone.practice_pal_engine.repositories;

import com.capstone.practice_pal_engine.models.Course;
import com.capstone.practice_pal_engine.models.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CourseRepository extends JpaRepository<Course, Long> {
    Optional<Course> findByIdAndUser(Long id, User user);

    List<Course> findByUser(User user);
}
