package com.securepass.ai.controller;

import com.securepass.ai.entity.User;
import com.securepass.ai.entity.UserPreferences;
import com.securepass.ai.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile() {
        User user = getAuthenticatedUser();
        Map<String, Object> profile = new HashMap<>();
        profile.put("id", user.getId());
        profile.put("username", user.getUsername());
        profile.put("email", user.getEmail());
        profile.put("emailVerified", user.isEmailVerified());
        profile.put("createdAt", user.getCreatedAt());
        return ResponseEntity.ok(profile);
    }

    @GetMapping("/preferences")
    public ResponseEntity<UserPreferences> getPreferences() {
        User user = getAuthenticatedUser();
        UserPreferences preferences = userService.getPreferences(user.getId());
        return ResponseEntity.ok(preferences);
    }

    @PutMapping("/preferences")
    public ResponseEntity<UserPreferences> updatePreferences(@RequestBody UserPreferences preferences) {
        User user = getAuthenticatedUser();
        UserPreferences updated = userService.updatePreferences(user.getId(), preferences);
        return ResponseEntity.ok(updated);
    }

    private User getAuthenticatedUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userService.getUserByUsername(username);
    }
}
