package com.hprs.controller;

import com.hprs.dto.AppointmentDto;
import com.hprs.security.JwtUtil;
import com.hprs.service.AppointmentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final JwtUtil jwtUtil;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public ResponseEntity<AppointmentDto> createAppointment(@Valid @RequestBody AppointmentDto dto, HttpServletRequest request) {
        Long currentUserId = extractUserId(request);
        String ipAddress = request.getRemoteAddr();
        return new ResponseEntity<>(appointmentService.createAppointment(dto, currentUserId, ipAddress), HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'RECEPTIONIST', 'NURSE')")
    public ResponseEntity<List<AppointmentDto>> getAppointments(
            @RequestParam(required = false) Long doctorId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDate queryDate = (date != null) ? date : LocalDate.now();
        return ResponseEntity.ok(appointmentService.getAppointmentsForDate(doctorId, queryDate));
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'RECEPTIONIST', 'NURSE')")
    public ResponseEntity<List<AppointmentDto>> getPatientAppointments(@PathVariable Long patientId) {
        return ResponseEntity.ok(appointmentService.getPatientAppointments(patientId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'DOCTOR')")
    public ResponseEntity<AppointmentDto> updateAppointmentStatus(
            @PathVariable Long id,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime newDatetime,
            HttpServletRequest request) {
        Long currentUserId = extractUserId(request);
        String ipAddress = request.getRemoteAddr();
        return ResponseEntity.ok(appointmentService.updateAppointmentStatus(id, status, newDatetime, currentUserId, ipAddress));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public ResponseEntity<Map<String, String>> cancelAppointment(@PathVariable Long id, HttpServletRequest request) {
        Long currentUserId = extractUserId(request);
        String ipAddress = request.getRemoteAddr();
        appointmentService.cancelAppointment(id, currentUserId, ipAddress);
        return ResponseEntity.ok(Map.of("message", "Appointment cancelled successfully"));
    }

    private Long extractUserId(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return jwtUtil.extractUserId(authHeader.substring(7));
        }
        return null;
    }
}
