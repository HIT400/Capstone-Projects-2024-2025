package com.capstone.practice_pal_engine.repositories;

import com.capstone.practice_pal_engine.models.Test;
import com.capstone.practice_pal_engine.models.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

//@Repository
public interface TestRepository extends JpaRepository<Test, Long> {
    List<Test> findByUser(User user);

    Optional<Test> findByIdAndUser(Long id, User user);
}
