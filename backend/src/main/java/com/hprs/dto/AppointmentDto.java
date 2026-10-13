package com.hprs.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentDto {

    private Long appointmentId;

    @NotNull(message = "Patient ID is required")
    private Long patientId;
    private String patientName;
    private String patientUhid;
    private String patientPhone;

    @NotNull(message = "Doctor ID is required")
    private Long doctorId;
    private String doctorName;
    private String doctorSpecialization;

    @NotNull(message = "Hospital ID is required")
    private Long hospitalId;
    private String hospitalName;

    @NotNull(message = "Appointment date and time is required")
    private LocalDateTime appointmentDatetime;

    private String reason;
    private String status; // SCHEDULED, COMPLETED, CANCELLED, NO_SHOW
    private LocalDateTime createdAt;
}
