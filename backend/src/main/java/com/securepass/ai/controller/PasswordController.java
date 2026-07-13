package com.securepass.ai.controller;

import com.securepass.ai.dto.*;
import com.securepass.ai.entity.User;
import com.securepass.ai.service.PasswordAnalysisService;
import com.securepass.ai.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/password")
public class PasswordController {

    private final PasswordAnalysisService analysisService;
    private final UserService userService;

    public PasswordController(PasswordAnalysisService analysisService, UserService userService) {
        this.analysisService = analysisService;
        this.userService = userService;
    }

    @PostMapping("/analyze")
    public ResponseEntity<AnalysisResponse> analyzePassword(@Valid @RequestBody PasswordAnalysisRequest request) {
        User user = getAuthenticatedUser();
        AnalysisResponse response = analysisService.analyzePassword(request.getPassword(), user);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/suggest")
    public ResponseEntity<MessageResponse> generatePassword(@RequestBody PasswordGenerationRequest request) {
        String password = analysisService.generatePassword(request);
        return ResponseEntity.ok(new MessageResponse(password));
    }

    @PostMapping("/upgrade")
    public ResponseEntity<PasswordUpgradeResponse> upgradePassword(@Valid @RequestBody PasswordUpgradeRequest request) {
        PasswordUpgradeResponse response = analysisService.upgradePassword(request.getPassword());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/hibp-check")
    public ResponseEntity<Map<String, Object>> checkBreaches(@Valid @RequestBody PasswordAnalysisRequest request) {
        Map<String, Object> result = analysisService.checkHIBPBreach(request.getPassword());
        return ResponseEntity.ok(result);
    }

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() &&
                !(authentication instanceof AnonymousAuthenticationToken)) {
            String username = authentication.getName();
            try {
                return userService.getUserByUsername(username);
            } catch (Exception e) {
                // Ignore and treat as guest
            }
        }
        return null;
    }
}
