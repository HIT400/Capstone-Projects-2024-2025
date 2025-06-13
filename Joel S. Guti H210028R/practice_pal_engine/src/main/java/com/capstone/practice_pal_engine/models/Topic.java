package com.capstone.practice_pal_engine.models;

import jakarta.persistence.Embeddable;

@Embeddable
public record Topic(int index, String name) {}
