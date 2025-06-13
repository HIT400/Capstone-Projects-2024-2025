package com.capstone.practice_pal_engine.dto.response;

import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PracticePalResponse {
    private String message;
    private Object data;
}
