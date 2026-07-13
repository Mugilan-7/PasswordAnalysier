package com.securepass.ai.repository;

import com.securepass.ai.entity.PasswordAnalysisHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PasswordAnalysisHistoryRepository extends JpaRepository<PasswordAnalysisHistory, Long> {
    List<PasswordAnalysisHistory> findByUserIdOrderByAnalyzedAtDesc(Long userId);
    
    @Query("SELECT h FROM PasswordAnalysisHistory h WHERE h.user.id = :userId AND " +
           "(LOWER(h.grade) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(h.crackTimeEstimated) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<PasswordAnalysisHistory> searchHistory(@Param("userId") Long userId, @Param("search") String search);
    
    void deleteByUserId(Long userId);
}
