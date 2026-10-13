package com.hprs.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VisitDto {

    private Long visitId;

    @NotNull(message = "Patient ID is required")
    private Long patientId;
    private String patientName;
    private String patientUhid;

    @NotNull(message = "Doctor ID is required")
    private Long doctorId;
    private String doctorName;

    @NotNull(message = "Hospital ID is required")
    private Long hospitalId;
    private String hospitalName;

    private Long appointmentId;
    private LocalDateTime visitDate;
    private String symptoms;
    private String vitals;
    private String diagnosis;
    private String notes;

    private List<PrescriptionDto> prescriptions;
    private List<LabTestDto> labTests;
}
