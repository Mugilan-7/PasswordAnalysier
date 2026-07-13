package com.securepass.ai.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SavedPasswordRequest {
    @NotBlank(message = "Label is required")
    private String label;

    @NotBlank(message = "Password is required")
    private String password;
}
