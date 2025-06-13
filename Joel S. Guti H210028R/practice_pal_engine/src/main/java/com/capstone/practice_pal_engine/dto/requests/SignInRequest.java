package com.capstone.practice_pal_engine.dto.requests;


import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SignInRequest {
    @NonNull
    private String email;

    @NonNull
    private String password;
}
