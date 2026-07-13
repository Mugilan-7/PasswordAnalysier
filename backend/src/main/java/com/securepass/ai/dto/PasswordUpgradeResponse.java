package com.securepass.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PasswordUpgradeResponse {
    private String originalPassword;
    private String upgradedPassword;
    private String explanation;
    private int originalScore;
    private int upgradedScore;
}
