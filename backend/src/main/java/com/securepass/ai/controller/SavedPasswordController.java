package com.securepass.ai.controller;

import com.securepass.ai.dto.SavedPasswordRequest;
import com.securepass.ai.dto.SavedPasswordResponse;
import com.securepass.ai.entity.User;
import com.securepass.ai.service.SavedPasswordService;
import com.securepass.ai.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/saved-passwords")
public class SavedPasswordController {

    private final SavedPasswordService savedPasswordService;
    private final UserService userService;

    public SavedPasswordController(SavedPasswordService savedPasswordService, UserService userService) {
        this.savedPasswordService = savedPasswordService;
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<SavedPasswordResponse> savePassword(@Valid @RequestBody SavedPasswordRequest request) {
        User user = getAuthenticatedUser();
        SavedPasswordResponse response = savedPasswordService.savePassword(request, user);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<SavedPasswordResponse>> getSavedPasswords() {
        User user = getAuthenticatedUser();
        List<SavedPasswordResponse> response = savedPasswordService.getSavedPasswords(user.getId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    public ResponseEntity<List<SavedPasswordResponse>> searchSavedPasswords(@RequestParam("q") String query) {
        User user = getAuthenticatedUser();
        List<SavedPasswordResponse> response = savedPasswordService.searchSavedPasswords(user.getId(), query);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePassword(@PathVariable("id") Long id) {
        User user = getAuthenticatedUser();
        savedPasswordService.deletePassword(id, user.getId());
        return ResponseEntity.ok().build();
    }

    private User getAuthenticatedUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userService.getUserByUsername(username);
    }
}
