package com.capstone.practice_pal_engine.repositories;

import com.capstone.practice_pal_engine.models.TestResults;
import com.capstone.practice_pal_engine.models.User;
import org.springframework.data.repository.CrudRepository;

import java.util.List;
import java.util.Optional;

public interface TestResultsRepository extends CrudRepository<TestResults, Long> {
    List<TestResults> findByUser(User user);

    Optional<TestResults> findByIdAndUser(Long id, User user);
}
