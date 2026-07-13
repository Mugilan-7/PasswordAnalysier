package com.securepass.ai.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString(exclude = "password")
public class PasswordAnalysisRequest {
    @NotBlank(message = "Password cannot be blank")
    private String password;
}
