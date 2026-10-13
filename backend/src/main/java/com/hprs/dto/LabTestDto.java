package com.hprs.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LabTestDto {

    private Long labTestId;
    private Long visitId;
    private String testName;
    private String result;
    private String status; // ORDERED, COMPLETED
}
