package com.securepass.ai.service;

import com.securepass.ai.dto.DashboardMetricsResponse;
import com.securepass.ai.entity.PasswordAnalysisHistory;
import com.securepass.ai.entity.SecurityQuizScore;
import com.securepass.ai.repository.PasswordAnalysisHistoryRepository;
import com.securepass.ai.repository.SecurityQuizScoreRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final PasswordAnalysisHistoryRepository historyRepository;
    private final SecurityQuizScoreRepository quizScoreRepository;

    public DashboardService(PasswordAnalysisHistoryRepository historyRepository,
                            SecurityQuizScoreRepository quizScoreRepository) {
        this.historyRepository = historyRepository;
        this.quizScoreRepository = quizScoreRepository;
    }

    @Transactional(readOnly = true)
    public DashboardMetricsResponse getDashboardMetrics(Long userId) {
        List<PasswordAnalysisHistory> history = historyRepository.findByUserIdOrderByAnalyzedAtDesc(userId);
        
        long totalChecked = history.size();
        double averageScore = 0.0;
        long weakCount = 0;
        long strongCount = 0;

        if (totalChecked > 0) {
            long scoreSum = 0;
            for (PasswordAnalysisHistory h : history) {
                scoreSum += h.getScore();
                if (h.getScore() < 40) {
                    weakCount++;
                } else if (h.getScore() >= 80) {
                    strongCount++;
                }
            }
            averageScore = (double) scoreSum / totalChecked;
        }

        List<PasswordAnalysisHistory> trendSubList = history.stream()
                .limit(10)
                .collect(Collectors.toList());
        Collections.reverse(trendSubList);

        List<DashboardMetricsResponse.ScoreTrendPoint> trend = trendSubList.stream()
                .map(h -> DashboardMetricsResponse.ScoreTrendPoint.builder()
                        .date(h.getAnalyzedAt())
                        .score(h.getScore())
                        .build())
                .collect(Collectors.toList());

        List<SecurityQuizScore> quizScores = quizScoreRepository.findByUserIdOrderByCompletedAtDesc(userId);
        List<String> badges = quizScores.stream()
                .map(SecurityQuizScore::getBadgeEarned)
                .filter(badge -> badge != null && !badge.isBlank())
                .distinct()
                .collect(Collectors.toList());

        return DashboardMetricsResponse.builder()
                .averagePasswordScore(averageScore)
                .totalPasswordsChecked(totalChecked)
                .weakPasswordCount(weakCount)
                .strongPasswordCount(strongCount)
                .securityImprovementTrend(trend)
                .badgesEarned(badges)
                .build();
    }
}
