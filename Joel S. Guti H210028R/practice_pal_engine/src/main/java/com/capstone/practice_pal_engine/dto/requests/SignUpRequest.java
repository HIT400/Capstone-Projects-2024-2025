package com.capstone.practice_pal_engine.dto.requests;

import com.capstone.practice_pal_engine.models.enums.Role;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SignUpRequest {
    @NonNull
    private String fullName;

    @NonNull
    private String email;

    @NonNull
    private String password;

    @NonNull
    private Role role;
}
