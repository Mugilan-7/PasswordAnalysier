package com.securepass.ai.controller;

import com.securepass.ai.dto.QuizSubmitRequest;
import com.securepass.ai.entity.SecurityQuizScore;
import com.securepass.ai.entity.User;
import com.securepass.ai.service.QuizService;
import com.securepass.ai.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quiz")
public class QuizController {

    private final QuizService quizService;
    private final UserService userService;

    public QuizController(QuizService quizService, UserService userService) {
        this.quizService = quizService;
        this.userService = userService;
    }

    @PostMapping("/submit")
    public ResponseEntity<SecurityQuizScore> submitScore(@Valid @RequestBody QuizSubmitRequest request) {
        User user = getAuthenticatedUser();
        SecurityQuizScore score = quizService.submitScore(request, user);
        return ResponseEntity.ok(score);
    }

    @GetMapping("/history")
    public ResponseEntity<List<SecurityQuizScore>> getHistory() {
        User user = getAuthenticatedUser();
        List<SecurityQuizScore> history = quizService.getScoreHistory(user.getId());
        return ResponseEntity.ok(history);
    }

    private User getAuthenticatedUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userService.getUserByUsername(username);
    }
}
