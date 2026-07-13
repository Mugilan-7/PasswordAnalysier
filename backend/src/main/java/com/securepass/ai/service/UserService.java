package com.securepass.ai.service;

import com.securepass.ai.config.JwtTokenProvider;
import com.securepass.ai.dto.*;
import com.securepass.ai.entity.User;
import com.securepass.ai.entity.UserPreferences;
import com.securepass.ai.exception.BadRequestException;
import com.securepass.ai.exception.ResourceNotFoundException;
import com.securepass.ai.repository.UserPreferencesRepository;
import com.securepass.ai.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final UserPreferencesRepository preferencesRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    public UserService(UserRepository userRepository,
                       UserPreferencesRepository preferencesRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.preferencesRepository = preferencesRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
    }

    @Transactional
    public User registerUser(SignupRequest signupRequest) {
        if (userRepository.existsByUsername(signupRequest.getUsername())) {
            throw new BadRequestException("Username is already taken");
        }
        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        User user = User.builder()
                .username(signupRequest.getUsername())
                .email(signupRequest.getEmail())
                .passwordHash(passwordEncoder.encode(signupRequest.getPassword()))
                .verificationToken(UUID.randomUUID().toString())
                .emailVerified(false)
                .build();

        User savedUser = userRepository.save(user);

        UserPreferences preferences = UserPreferences.builder()
                .user(savedUser)
                .theme("dark")
                .preferredLength(16)
                .includeUppercase(true)
                .includeLowercase(true)
                .includeNumbers(true)
                .includeSymbols(true)
                .excludeSimilar(false)
                .build();

        preferencesRepository.save(preferences);
        savedUser.setPreferences(preferences);

        return savedUser;
    }

    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return JwtResponse.builder()
                .token(jwt)
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .emailVerified(user.isEmailVerified())
                .build();
    }

    @Transactional
    public void verifyEmail(String token) {
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid email verification token"));
        
        user.setEmailVerified(true);
        user.setVerificationToken(null);
        userRepository.save(user);
    }

    @Transactional
    public void initiatePasswordReset(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email " + request.getEmail()));

        user.setResetToken(UUID.randomUUID().toString());
        user.setResetTokenExpiry(LocalDateTime.now().plusHours(1));
        userRepository.save(user);

        // Simulation trace
        System.out.println("DEBUG: Password Reset Link: http://localhost:5173/reset-password?token=" + user.getResetToken());
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByResetToken(request.getToken())
                .orElseThrow(() -> new BadRequestException("Invalid or expired reset token"));

        if (user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Reset token has expired");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);
    }

    public UserPreferences getPreferences(Long userId) {
        return preferencesRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Preferences not found for user " + userId));
    }

    @Transactional
    public UserPreferences updatePreferences(Long userId, UserPreferences updatedPref) {
        UserPreferences existing = preferencesRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Preferences not found for user " + userId));

        existing.setTheme(updatedPref.getTheme());
        existing.setPreferredLength(updatedPref.getPreferredLength());
        existing.setIncludeUppercase(updatedPref.isIncludeUppercase());
        existing.setIncludeLowercase(updatedPref.isIncludeLowercase());
        existing.setIncludeNumbers(updatedPref.isIncludeNumbers());
        existing.setIncludeSymbols(updatedPref.isIncludeSymbols());
        existing.setExcludeSimilar(updatedPref.isExcludeSimilar());

        return preferencesRepository.save(existing);
    }
    
    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + userId));
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username " + username));
    }
}
