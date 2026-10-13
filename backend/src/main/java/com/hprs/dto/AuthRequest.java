package com.hprs.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthRequest {

    @NotBlank(message = "Username/Email is required")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;
}
