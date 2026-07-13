package com.securepass.ai.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "password_analysis_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PasswordAnalysisHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Column(nullable = false)
    private int score;

    @Column(nullable = false)
    private double entropy;

    @Column(nullable = false, length = 20)
    private String grade; // e.g. Weak, Fair, Good, Strong, Excellent

    @Column(nullable = false, length = 50)
    private String crackTimeEstimated; // e.g. "10 years"

    @Column(nullable = false)
    private long crackTimeSeconds;

    @Column(nullable = false)
    private int characterCount;

    @Column(nullable = false)
    private int uppercaseCount;

    @Column(nullable = false)
    private int lowercaseCount;

    @Column(nullable = false)
    private int numbersCount;

    @Column(nullable = false)
    private int specialCount;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime analyzedAt;
}
