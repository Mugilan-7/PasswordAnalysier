package com.securepass.ai.repository;

import com.securepass.ai.entity.SecurityQuizScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SecurityQuizScoreRepository extends JpaRepository<SecurityQuizScore, Long> {
    List<SecurityQuizScore> findByUserIdOrderByCompletedAtDesc(Long userId);
}
