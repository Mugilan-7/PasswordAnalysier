package com.securepass.ai.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class QuizSubmitRequest {
    @Min(value = 0, message = "Score cannot be negative")
    private int score;

    @Min(value = 1, message = "Total questions must be at least 1")
    @Max(value = 50, message = "Total questions cannot exceed 50")
    private int totalQuestions;

    private String badgeEarned; // e.g. "SecurityPro", "CyberGuardian"
}
