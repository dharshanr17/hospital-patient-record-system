package com.hprs.dto;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardSummaryDto {

    private long totalPatients;
    private long appointmentsToday;
    private long totalVisits;
    private long totalDoctors;
    private List<AppointmentDto> recentAppointments;
    private List<VisitDto> recentVisits;
}
