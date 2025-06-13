package com.capstone.practice_pal_engine.services;

import com.capstone.practice_pal_engine.dto.response.StudentDashboard;
import com.capstone.practice_pal_engine.models.User;

public interface StudentService {
    User getStudent();

    StudentDashboard getDashboard();
}
