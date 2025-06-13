package com.capstone.practice_pal_engine.models.enums;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public enum Level {
    PRIMARY_SCHOOL,
    MIDDLE_SCHOOL,
    HIGH_SCHOOL,
    UNDERGRADUATE,
    POSTGRADUATE,
    DOCTORATE,
    TECHNICAL_EDUCATION;

    @Override
    public String toString() {
        return name().toLowerCase().replace("_"," ");
    }
}
