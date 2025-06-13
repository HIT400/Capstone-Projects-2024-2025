package com.capstone.practice_pal_engine.configs;

import com.capstone.practice_pal_engine.dto.response.PracticePalResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.reactive.resource.NoResourceFoundException;
import org.springframework.web.server.ResponseStatusException;

import java.util.Arrays;

@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(Exception.class)
    public ResponseEntity<PracticePalResponse> handleAllExceptions(Exception ex, WebRequest request) {
        System.out.println(ex.getMessage());
        ex.printStackTrace();
        return new ResponseEntity<>(new PracticePalResponse("An unexpected error occurred!", null), HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<PracticePalResponse> handleSignInExceptions(Exception ex, WebRequest request) {
        System.out.println(ex.getMessage());
        ex.printStackTrace();
        return new ResponseEntity<>(new PracticePalResponse("Wrong email or password!", null), HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<PracticePalResponse> handleStatusExceptions(ResponseStatusException ex, WebRequest request) {
        System.out.println(ex.getMessage());
        ex.printStackTrace();
        return new ResponseEntity<>(new PracticePalResponse(ex.getReason(), null), ex.getStatusCode());
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<PracticePalResponse> handleNoResourceFoundException(NoResourceFoundException ex, WebRequest request) {
        System.out.println(ex.getMessage());
        ex.printStackTrace();
        return new ResponseEntity<>(new PracticePalResponse(ex.getMessage(), null), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<PracticePalResponse> handleHttpRequestMethodNotSupportedException(HttpRequestMethodNotSupportedException ex, WebRequest request) {
        System.out.println(ex.getMessage());
        ex.printStackTrace();
        return new ResponseEntity<>(new PracticePalResponse(ex.getMessage(), null), HttpStatus.BAD_REQUEST);
    }
}
