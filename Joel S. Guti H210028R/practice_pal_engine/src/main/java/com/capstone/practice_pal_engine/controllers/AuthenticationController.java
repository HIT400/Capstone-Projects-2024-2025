package com.capstone.practice_pal_engine.controllers;

import com.capstone.practice_pal_engine.dto.response.PracticePalResponse;
import com.capstone.practice_pal_engine.implementations.AuthenticationServiceImpl;
import com.capstone.practice_pal_engine.dto.requests.SignInRequest;
import com.capstone.practice_pal_engine.dto.requests.SignUpRequest;
import com.capstone.practice_pal_engine.dto.response.AuthenticationResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthenticationController {
    private final AuthenticationServiceImpl service;

    @PostMapping("/signup")
    public ResponseEntity<PracticePalResponse> signup(@RequestBody SignUpRequest request) {
        return ResponseEntity.ok(new PracticePalResponse("Sign up successful", service.signup(request)));
    }

    @PostMapping("/signin")
    public ResponseEntity<PracticePalResponse> signin(@RequestBody SignInRequest request) {
        return ResponseEntity.ok(new PracticePalResponse("Sign in successful", service.signin(request)));
    }
}
