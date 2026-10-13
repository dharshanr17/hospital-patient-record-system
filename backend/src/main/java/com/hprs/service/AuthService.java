package com.hprs.service;

import com.hprs.dto.AuthRequest;
import com.hprs.dto.AuthResponse;
import com.hprs.model.User;
import com.hprs.repository.UserRepository;
import com.hprs.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final AuditLogService auditLogService;

    public AuthResponse login(AuthRequest request, String ipAddress) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + request.getEmail()));

        String token = jwtUtil.generateToken(
                user.getEmail(),
                user.getRole().name(),
                user.getUserId(),
                user.getHospital() != null ? user.getHospital().getHospitalId() : null
        );

        auditLogService.logAction(user.getUserId(), null, "LOGIN", "User logged in successfully", ipAddress);

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(user.getUserId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .hospitalId(user.getHospital() != null ? user.getHospital().getHospitalId() : null)
                .hospitalName(user.getHospital() != null ? user.getHospital().getName() : "All Hospitals")
                .build();
    }
}
