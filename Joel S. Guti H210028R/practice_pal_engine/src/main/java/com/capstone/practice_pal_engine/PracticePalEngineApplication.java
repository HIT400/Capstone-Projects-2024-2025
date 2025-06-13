package com.capstone.practice_pal_engine;

import com.capstone.practice_pal_engine.implementations.AuthenticationServiceImpl;
import com.capstone.practice_pal_engine.dto.requests.SignUpRequest;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import static com.capstone.practice_pal_engine.models.enums.Role.ADMIN;
import static com.capstone.practice_pal_engine.models.enums.Role.STUDENT;

@SpringBootApplication
public class PracticePalEngineApplication {

    public static void main(String[] args) {
        SpringApplication.run(PracticePalEngineApplication.class, args);
    }

//    @Bean
//    public CommandLineRunner commandLineRunner(AuthenticationServiceImpl service) {
//        return args -> {
//            var admin = SignUpRequest
//                    .builder()
//                    .fullName("Admin")
//                    .email("admin@example.com")
//                    .password("pass123")
//                    .role(ADMIN)
//                    .build();
//            System.out.println("ADMIN TOKEN : " + service.signup(admin).getToken());
//
//            var student = SignUpRequest
//                    .builder()
//                    .fullName("Student")
//                    .email("student@example.com")
//                    .password("pass123")
//                    .role(STUDENT)
//                    .build();
//            System.out.println("STUDENT TOKEN : " + service.signup(student).getToken());
//        };
//    }
}


