package com.securepass.ai.service;

import com.securepass.ai.dto.QuizSubmitRequest;
import com.securepass.ai.entity.SecurityQuizScore;
import com.securepass.ai.entity.User;
import com.securepass.ai.repository.SecurityQuizScoreRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class QuizService {

    private final SecurityQuizScoreRepository repository;

    public QuizService(SecurityQuizScoreRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public SecurityQuizScore submitScore(QuizSubmitRequest request, User user) {
        String badge = request.getBadgeEarned();
        
        // Auto-assign badge based on score if none supplied
        if (badge == null || badge.isBlank()) {
            double percentage = (double) request.getScore() / request.getTotalQuestions();
            if (percentage >= 1.0) {
                badge = "RootMaster";
            } else if (percentage >= 0.9) {
                badge = "CyberSentry";
            } else if (percentage >= 0.8) {
                badge = "PassShield";
            } else if (percentage >= 0.6) {
                badge = "CryptoNovice";
            }
        }

        SecurityQuizScore entity = SecurityQuizScore.builder()
                .user(user)
                .score(request.getScore())
                .totalQuestions(request.getTotalQuestions())
                .badgeEarned(badge)
                .build();

        return repository.save(entity);
    }

    @Transactional(readOnly = true)
    public List<SecurityQuizScore> getScoreHistory(Long userId) {
        return repository.findByUserIdOrderByCompletedAtDesc(userId);
    }
}
