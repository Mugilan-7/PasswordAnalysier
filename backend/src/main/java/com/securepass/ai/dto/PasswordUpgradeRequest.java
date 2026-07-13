package com.securepass.ai.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString(exclude = "password")
public class PasswordUpgradeRequest {
    @NotBlank(message = "Password to upgrade is required")
    private String password;
}
