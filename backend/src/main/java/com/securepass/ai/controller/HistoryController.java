package com.securepass.ai.controller;

import com.securepass.ai.entity.PasswordAnalysisHistory;
import com.securepass.ai.entity.User;
import com.securepass.ai.repository.PasswordAnalysisHistoryRepository;
import com.securepass.ai.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/history")
public class HistoryController {

    private final PasswordAnalysisHistoryRepository historyRepository;
    private final UserService userService;

    public HistoryController(PasswordAnalysisHistoryRepository historyRepository, UserService userService) {
        this.historyRepository = historyRepository;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<PasswordAnalysisHistory>> getHistory() {
        User user = getAuthenticatedUser();
        List<PasswordAnalysisHistory> history = historyRepository.findByUserIdOrderByAnalyzedAtDesc(user.getId());
        return ResponseEntity.ok(history);
    }

    @GetMapping("/search")
    public ResponseEntity<List<PasswordAnalysisHistory>> searchHistory(@RequestParam("q") String query) {
        User user = getAuthenticatedUser();
        List<PasswordAnalysisHistory> history = historyRepository.searchHistory(user.getId(), query);
        return ResponseEntity.ok(history);
    }

    @DeleteMapping("/clear")
    @Transactional
    public ResponseEntity<?> clearHistory() {
        User user = getAuthenticatedUser();
        historyRepository.deleteByUserId(user.getId());
        return ResponseEntity.ok().build();
    }

    private User getAuthenticatedUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userService.getUserByUsername(username);
    }
}
