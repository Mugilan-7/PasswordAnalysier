package com.securepass.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardMetricsResponse {
    private double averagePasswordScore;
    private long totalPasswordsChecked;
    private long weakPasswordCount;
    private long strongPasswordCount;
    private List<ScoreTrendPoint> securityImprovementTrend;
    private List<String> badgesEarned;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ScoreTrendPoint {
        private LocalDateTime date;
        private int score;
    }
}
