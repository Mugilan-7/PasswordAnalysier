package com.securepass.ai.repository;

import com.securepass.ai.entity.SavedPassword;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SavedPasswordRepository extends JpaRepository<SavedPassword, Long> {
    List<SavedPassword> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    @Query("SELECT s FROM SavedPassword s WHERE s.user.id = :userId AND LOWER(s.label) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<SavedPassword> searchSavedPasswords(@Param("userId") Long userId, @Param("search") String search);
    
    void deleteByUserId(Long userId);
}
