package com.securepass.ai.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PasswordGenerationRequest {

    @Min(value = 8, message = "Length must be at least 8")
    @Max(value = 64, message = "Length cannot exceed 64")
    private int length = 16;

    private boolean includeUppercase = true;
    private boolean includeLowercase = true;
    private boolean includeNumbers = true;
    private boolean includeSymbols = true;
    
    private boolean easyToRead = false; // Exclude similar characters manually
    private boolean easyToType = false;
    private boolean excludeSimilar = false;
}
