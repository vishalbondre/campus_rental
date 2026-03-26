package com.campusrental.service;

import com.campusrental.dto.*;
import com.campusrental.entity.User;
import com.campusrental.repository.UserRepository;
import com.campusrental.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authManager;
    private final JavaMailSender mailSender;

    @Value("${app.email.verification.base-url}")
    private String verificationBaseUrl;

    @Value("${app.email.from}")
    private String fromEmail;

    // In-memory token store — use Redis in production
    private final ConcurrentHashMap<String, Long> emailVerificationTokens = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Long> passwordResetTokens      = new ConcurrentHashMap<>();

    @Transactional
    public UserDTO register(RegisterRequest req) {
        if (userRepo.existsByEmailId(req.emailId())) {
            throw new IllegalArgumentException("Email address already registered.");
        }

        User user = User.builder()
            .emailId(req.emailId())
            .passwordHash(passwordEncoder.encode(req.password()))
            .fullName(req.fullName())
            .campusName(req.campusName())
            .phoneNumber(req.phoneNumber())
            .role(User.Role.STUDENT)
            .isVerified(true)               // <--- Make this false durig production 
            .build();

        userRepo.save(user);
        // sendVerificationEmail(user);  // I've comment this line for dev purpose gmail verifications
        log.info("New student registered: {}", user.getEmailId());
        return toDTO(user);
    }

    public AuthResponse login(LoginRequest req) {
        Authentication auth = authManager.authenticate(
            new UsernamePasswordAuthenticationToken(req.emailId(), req.password()));

        User user = userRepo.findByEmailId(req.emailId())
            .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        if (!user.isVerified()) {
            throw new IllegalStateException("Please verify your campus email before logging in.");
        }

        String token = jwtUtils.generateToken(user);
        return AuthResponse.of(token, toDTO(user));
    }

    @Transactional
    public void verifyEmail(String token) {
        Long userId = emailVerificationTokens.remove(token);
        if (userId == null) throw new IllegalArgumentException("Invalid or expired verification token.");
        User user = userRepo.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found."));
        user.setVerified(true);
        userRepo.save(user);
        log.info("Email verified for user: {}", user.getEmailId());
    }

    public void initiatePasswordReset(String email) {
        userRepo.findByEmailId(email).ifPresent(user -> {
            String token = UUID.randomUUID().toString();
            passwordResetTokens.put(token, user.getUserId());
            sendPasswordResetEmail(user, token);
        });
        // Always return success to prevent email enumeration
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest req) {
        Long userId = passwordResetTokens.remove(req.token());
        if (userId == null) throw new IllegalArgumentException("Invalid or expired reset token.");
        User user = userRepo.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found."));
        user.setPasswordHash(passwordEncoder.encode(req.newPassword()));
        userRepo.save(user);
    }

    private void sendVerificationEmail(User user) {
        String token = UUID.randomUUID().toString();
        emailVerificationTokens.put(token, user.getUserId());
        String link = verificationBaseUrl + "?token=" + token;

        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setFrom(fromEmail);
        msg.setTo(user.getEmailId());
        msg.setSubject("Verify your CampusRent account");
        msg.setText("Hi " + user.getFullName() + ",\n\n"
            + "Please verify your campus email by clicking the link below:\n"
            + link + "\n\nThis link expires in 24 hours.\n\nThe CampusRent Team");
        mailSender.send(msg);
    }

    private void sendPasswordResetEmail(User user, String token) {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setFrom(fromEmail);
        msg.setTo(user.getEmailId());
        msg.setSubject("Reset your CampusRent password");
        msg.setText("Hi " + user.getFullName() + ",\n\n"
            + "Click the link to reset your password:\n"
            + verificationBaseUrl.replace("/verify", "/reset-password") + "?token=" + token
            + "\n\nIf you didn't request this, ignore this email.\n\nThe CampusRent Team");
        mailSender.send(msg);
    }

    private UserDTO toDTO(User u) {
        return UserDTO.builder()
            .userId(u.getUserId())
            .emailId(u.getEmailId())
            .fullName(u.getFullName())
            .campusName(u.getCampusName())
            .profileImage(u.getProfileImage())
            .role(u.getRole().name())
            .isVerified(u.isVerified())
            .ratingAvg(u.getRatingAvg())
            .ratingCount(u.getRatingCount())
            .createdAt(u.getCreatedAt())
            .build();
    }
}

// ── ItemService ───────────────────────────────────────────────
