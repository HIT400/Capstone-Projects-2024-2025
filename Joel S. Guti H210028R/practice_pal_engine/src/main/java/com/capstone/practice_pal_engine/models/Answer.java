package com.capstone.practice_pal_engine.models;

import jakarta.persistence.Embeddable;
import jakarta.persistence.Lob;
import lombok.NonNull;

@Embeddable
public record Answer(@NonNull Long questionIndex, @NonNull String answer) {
}
