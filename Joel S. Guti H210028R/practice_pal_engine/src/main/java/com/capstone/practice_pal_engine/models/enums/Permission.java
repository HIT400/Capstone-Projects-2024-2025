package com.capstone.practice_pal_engine.models.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum Permission {
    ADMIN_READ("admin:read"),
    ADMIN_UPDATE("admin:update"),
    ADMIN_CREATE("admin:create"),
    ADMIN_DELETE("admin:delete"),

    STUDENT_READ("student:read"),
    STUDENT_UPDATE("student:update"),
    STUDENT_DELETE("student:delete"),

    COURSE_READ("course:read"),
    COURSE_UPDATE("course:update"),
    COURSE_CREATE("course:create"),
    COURSE_DELETE("course:delete"),

    ;

    private final String permission;
}
