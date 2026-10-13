package com.hprs.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDto {

    private Long userId;
    private Long hospitalId;
    private String hospitalName;

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    private String password;
    private String role; // ADMIN, DOCTOR, RECEPTIONIST, NURSE
    private Long departmentId;
    private String departmentName;
    private String specialization;
    private Boolean active;
}
