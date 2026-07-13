package com.securepass.ai.service;

import com.securepass.ai.dto.SavedPasswordRequest;
import com.securepass.ai.dto.SavedPasswordResponse;
import com.securepass.ai.entity.SavedPassword;
import com.securepass.ai.entity.User;
import com.securepass.ai.exception.BadRequestException;
import com.securepass.ai.exception.ResourceNotFoundException;
import com.securepass.ai.repository.SavedPasswordRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SavedPasswordService {

    private final SavedPasswordRepository repository;
    private final EncryptionService encryptionService;

    public SavedPasswordService(SavedPasswordRepository repository, EncryptionService encryptionService) {
        this.repository = repository;
        this.encryptionService = encryptionService;
    }

    @Transactional
    public SavedPasswordResponse savePassword(SavedPasswordRequest request, User user) {
        String encrypted = encryptionService.encrypt(request.getPassword());

        SavedPassword saved = SavedPassword.builder()
                .user(user)
                .label(request.getLabel())
                .encryptedPassword(encrypted)
                .build();

        SavedPassword savedEntity = repository.save(saved);

        return SavedPasswordResponse.builder()
                .id(savedEntity.getId())
                .label(savedEntity.getLabel())
                .decryptedPassword(request.getPassword())
                .createdAt(savedEntity.getCreatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public List<SavedPasswordResponse> getSavedPasswords(Long userId) {
        List<SavedPassword> passwords = repository.findByUserIdOrderByCreatedAtDesc(userId);
        return passwords.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SavedPasswordResponse> searchSavedPasswords(Long userId, String search) {
        List<SavedPassword> passwords = repository.searchSavedPasswords(userId, search);
        return passwords.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deletePassword(Long id, Long userId) {
        SavedPassword entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Saved password not found with id " + id));

        if (!entity.getUser().getId().equals(userId)) {
            throw new BadRequestException("You do not own this saved password record");
        }

        repository.delete(entity);
    }

    private SavedPasswordResponse mapToResponse(SavedPassword entity) {
        String decrypted;
        try {
            decrypted = encryptionService.decrypt(entity.getEncryptedPassword());
        } catch (Exception e) {
            decrypted = "[Decryption Error]";
        }

        return SavedPasswordResponse.builder()
                .id(entity.getId())
                .label(entity.getLabel())
                .decryptedPassword(decrypted)
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
