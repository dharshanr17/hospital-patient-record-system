package com.hprs.service;

import com.hprs.dto.AuditLogDto;
import com.hprs.model.AuditLog;
import com.hprs.model.Patient;
import com.hprs.model.User;
import com.hprs.repository.AuditLogRepository;
import com.hprs.repository.PatientRepository;
import com.hprs.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    private final PatientRepository patientRepository;

    @Transactional
    public void logAction(Long userId, Long patientId, String action, String details, String ipAddress) {
        User user = (userId != null) ? userRepository.findById(userId).orElse(null) : null;
        Patient patient = (patientId != null) ? patientRepository.findById(patientId).orElse(null) : null;

        AuditLog log = AuditLog.builder()
                .user(user)
                .patient(patient)
                .action(action)
                .details(details)
                .timestamp(LocalDateTime.now())
                .ipAddress(ipAddress)
                .build();

        auditLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public List<AuditLogDto> getAllLogs() {
        return auditLogRepository.findTop50ByOrderByTimestampDesc().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AuditLogDto> filterLogs(Long userId, Long patientId, String action) {
        return auditLogRepository.filterAuditLogs(userId, patientId, action).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private AuditLogDto mapToDto(AuditLog log) {
        return AuditLogDto.builder()
                .auditId(log.getAuditId())
                .userId(log.getUser() != null ? log.getUser().getUserId() : null)
                .userName(log.getUser() != null ? log.getUser().getFullName() : "System")
                .userRole(log.getUser() != null ? log.getUser().getRole().name() : "SYSTEM")
                .patientId(log.getPatient() != null ? log.getPatient().getPatientId() : null)
                .patientName(log.getPatient() != null ? log.getPatient().getFullName() : null)
                .action(log.getAction())
                .details(log.getDetails())
                .timestamp(log.getTimestamp())
                .ipAddress(log.getIpAddress())
                .build();
    }
}
