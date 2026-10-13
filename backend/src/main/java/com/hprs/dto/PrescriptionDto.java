package com.hprs.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrescriptionDto {

    private Long prescriptionId;
    private Long visitId;

    @NotBlank(message = "Medicine name is required")
    private String medicineName;

    private String dosage;
    private String frequency;
    private String duration;
    private String instructions;
}
