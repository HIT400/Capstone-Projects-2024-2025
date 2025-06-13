package com.capstone.practice_pal_engine.services;

import com.capstone.practice_pal_engine.dto.requests.SignInRequest;
import com.capstone.practice_pal_engine.dto.requests.SignUpRequest;
import com.capstone.practice_pal_engine.dto.response.AuthenticationResponse;

public interface AuthenticationService {
    AuthenticationResponse signup(SignUpRequest request);
    public AuthenticationResponse signin(SignInRequest request);
}
