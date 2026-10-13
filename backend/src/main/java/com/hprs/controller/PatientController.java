package com.hprs.controller;

import com.hprs.dto.PatientDto;
import com.hprs.dto.VisitDto;
import com.hprs.security.JwtUtil;
import com.hprs.service.PatientService;
import com.hprs.service.VisitService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;
    private final VisitService visitService;
    private final JwtUtil jwtUtil;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public ResponseEntity<PatientDto> registerPatient(@Valid @RequestBody PatientDto dto, HttpServletRequest request) {
        Long currentUserId = extractUserId(request);
        String ipAddress = request.getRemoteAddr();
        return new ResponseEntity<>(patientService.registerPatient(dto, currentUserId, ipAddress), HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'RECEPTIONIST', 'NURSE')")
    public ResponseEntity<List<PatientDto>> searchPatients(@RequestParam(value = "query", required = false) String query) {
        return ResponseEntity.ok(patientService.searchPatients(query));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'RECEPTIONIST', 'NURSE')")
    public ResponseEntity<PatientDto> getPatientById(@PathVariable Long id) {
        return ResponseEntity.ok(patientService.getPatientById(id));
    }

    @GetMapping("/uhid/{uhid}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'RECEPTIONIST', 'NURSE')")
    public ResponseEntity<PatientDto> getPatientByUhid(@PathVariable String uhid) {
        return ResponseEntity.ok(patientService.getPatientByUhid(uhid));
    }

    @GetMapping("/check-duplicates")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public ResponseEntity<List<PatientDto>> checkDuplicates(
            @RequestParam String fullName,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dob,
            @RequestParam String phone) {
        return ResponseEntity.ok(patientService.checkDuplicates(fullName, dob, phone));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public ResponseEntity<PatientDto> updatePatient(@PathVariable Long id, @Valid @RequestBody PatientDto dto, HttpServletRequest request) {
        Long currentUserId = extractUserId(request);
        String ipAddress = request.getRemoteAddr();
        return ResponseEntity.ok(patientService.updatePatient(id, dto, currentUserId, ipAddress));
    }

    @GetMapping("/{id}/history")
    @PreAuthorize("hasAnyRole('DOCTOR', 'NURSE', 'ADMIN')")
    public ResponseEntity<List<VisitDto>> getPatientHistory(@PathVariable Long id) {
        return ResponseEntity.ok(visitService.getPatientVisits(id));
    }

    private Long extractUserId(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return jwtUtil.extractUserId(authHeader.substring(7));
        }
        return null;
    }
}
