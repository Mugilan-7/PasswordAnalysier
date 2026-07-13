package com.securepass.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavedPasswordResponse {
    private Long id;
    private String label;
    private String decryptedPassword;
    private LocalDateTime createdAt;
}
