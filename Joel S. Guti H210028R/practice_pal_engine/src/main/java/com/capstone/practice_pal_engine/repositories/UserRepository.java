package com.capstone.practice_pal_engine.repositories;

import com.capstone.practice_pal_engine.models.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
}
