package com.capstone.practice_pal_engine.models;

import com.capstone.practice_pal_engine.models.enums.Difficulty;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "tests")
public class Test {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;
    private String title;
    private Difficulty difficulty;
    private Date createdAt;

    @ManyToOne
    @JoinColumn(name = "course_id")
    @JsonIgnore
    private Course course;

    @ElementCollection
    @CollectionTable(name = "test_questions", joinColumns = @JoinColumn(name = "test_id"))
    private List<Question> questions;

    @OneToMany(mappedBy = "test")
    @JsonIgnore
    private List<TestResults> results;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;
}
