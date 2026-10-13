package com.hprs.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLogDto {

    private Long auditId;
    private Long userId;
    private String userName;
    private String userRole;
    private Long patientId;
    private String patientName;
    private String action;
    private String details;
    private LocalDateTime timestamp;
    private String ipAddress;
}
