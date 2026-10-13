package com.hprs.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientDto {

    private Long patientId;
    private String uhid;

    @NotBlank(message = "Patient name is required")
    private String fullName;

    private LocalDate dateOfBirth;
    private String gender;

    @Pattern(regexp = "^$|^[0-9+\\-\\s()]{7,20}$", message = "Invalid phone number format")
    private String phone;

    private String email;
    private String address;
    private String bloodGroup;
    private String allergies;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private Long registeredHospitalId;
    private String registeredHospitalName;
    private LocalDateTime createdAt;
}
