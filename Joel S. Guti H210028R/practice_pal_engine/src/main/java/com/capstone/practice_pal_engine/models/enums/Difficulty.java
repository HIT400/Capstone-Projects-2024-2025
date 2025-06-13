package com.capstone.practice_pal_engine.models.enums;

public enum Difficulty {
    EASY,
    MEDIUM,
    HARD,
    VERY_HARD;

    @Override
    public String toString() {
        return name().toLowerCase().replace("_"," ");
    }
}
