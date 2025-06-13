package com.capstone.practice_pal_engine.configs;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import static com.capstone.practice_pal_engine.models.enums.Permission.*;
import static com.capstone.practice_pal_engine.models.enums.Role.ADMIN;
import static com.capstone.practice_pal_engine.models.enums.Role.STUDENT;
import static org.springframework.http.HttpMethod.*;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        // Allow public access to authentication APIs
                        .requestMatchers("/api/v1/auth/**").permitAll()

                        // Allow Swagger UI and API docs
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()

                        // Admin-specific routes
                        .requestMatchers("/api/v1/admin/**").hasRole(ADMIN.name())
                        .requestMatchers(GET, "/api/v1/admin/**").hasAuthority(ADMIN_READ.name())
                        .requestMatchers(POST, "/api/v1/admin/**").hasAuthority(ADMIN_CREATE.name())
                        .requestMatchers(PUT, "/api/v1/admin/**").hasAuthority(ADMIN_UPDATE.name())
                        .requestMatchers(DELETE, "/api/v1/admin/**").hasAuthority(ADMIN_DELETE.name())

                        // Student-specific routes
                        .requestMatchers("/api/v1/student/**").hasRole(STUDENT.name())
                        .requestMatchers(GET, "/api/v1/student/**").hasAuthority(STUDENT_READ.name())
                        .requestMatchers(PUT, "/api/v1/student/**").hasAuthority(STUDENT_UPDATE.name())
                        .requestMatchers(DELETE, "/api/v1/student/**").hasAuthority(STUDENT_DELETE.name())

                        // Management routes
//                        .requestMatchers("/api/v1/course/**").hasAnyRole(ADMIN.name(), STUDENT.name())
//                        .requestMatchers(GET, "/api/v1/course/**").hasAnyAuthority(ADMIN_READ.name(), STUDENT_READ.name())
//                        .requestMatchers(PUT, "/api/v1/course/**").hasAnyAuthority(ADMIN_UPDATE.name(), STUDENT_UPDATE.name())
//                        .requestMatchers(DELETE, "/api/v1/course/**").hasAnyAuthority(ADMIN_DELETE.name(), STUDENT_DELETE.name())

                        // Require authentication for all other requests
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
