package com.securepass.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalysisResponse {
    private int score;
    private double entropy;
    private String grade;
    private String crackTimeEstimated;
    private long crackTimeSeconds;
    private int characterCount;
    private int uppercaseCount;
    private int lowercaseCount;
    private int numbersCount;
    private int specialCount;
    private List<String> suggestions;
    private boolean pwned;
    private int breachCount;
}
