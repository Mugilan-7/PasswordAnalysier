package com.securepass.ai.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_preferences")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPreferences {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Column(nullable = false, length = 10)
    @Builder.Default
    private String theme = "dark";

    @Builder.Default
    private int preferredLength = 16;

    @Builder.Default
    private boolean includeUppercase = true;

    @Builder.Default
    private boolean includeLowercase = true;

    @Builder.Default
    private boolean includeNumbers = true;

    @Builder.Default
    private boolean includeSymbols = true;

    @Builder.Default
    private boolean excludeSimilar = false;
}
