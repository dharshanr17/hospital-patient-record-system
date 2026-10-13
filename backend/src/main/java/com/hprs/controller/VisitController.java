package com.hprs.controller;

import com.hprs.dto.PrescriptionDto;
import com.hprs.dto.VisitDto;
import com.hprs.security.JwtUtil;
import com.hprs.service.VisitService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/visits")
@RequiredArgsConstructor
public class VisitController {

    private final VisitService visitService;
    private final JwtUtil jwtUtil;

    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<VisitDto> recordVisit(@Valid @RequestBody VisitDto dto, HttpServletRequest request) {
        Long currentUserId = extractUserId(request);
        String ipAddress = request.getRemoteAddr();
        return new ResponseEntity<>(visitService.recordVisit(dto, currentUserId, ipAddress), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'NURSE', 'ADMIN')")
    public ResponseEntity<VisitDto> getVisitById(@PathVariable Long id) {
        return ResponseEntity.ok(visitService.getVisitById(id));
    }

    @PostMapping("/{id}/prescriptions")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<List<PrescriptionDto>> addPrescriptions(
            @PathVariable Long id,
            @RequestBody List<PrescriptionDto> prescriptions,
            HttpServletRequest request) {
        Long currentUserId = extractUserId(request);
        String ipAddress = request.getRemoteAddr();
        return ResponseEntity.ok(visitService.addPrescriptions(id, prescriptions, currentUserId, ipAddress));
    }

    @PostMapping("/{id}/lab-tests")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<List<com.hprs.dto.LabTestDto>> addLabTests(
            @PathVariable Long id,
            @RequestBody List<com.hprs.dto.LabTestDto> labTests,
            HttpServletRequest request) {
        Long currentUserId = extractUserId(request);
        String ipAddress = request.getRemoteAddr();
        return ResponseEntity.ok(visitService.addLabTests(id, labTests, currentUserId, ipAddress));
    }

    @PutMapping("/lab-tests/{labTestId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'NURSE', 'ADMIN')")
    public ResponseEntity<com.hprs.dto.LabTestDto> updateLabTest(
            @PathVariable Long labTestId,
            @RequestParam(required = false) String result,
            @RequestParam(required = false) String status,
            HttpServletRequest request) {
        Long currentUserId = extractUserId(request);
        String ipAddress = request.getRemoteAddr();
        return ResponseEntity.ok(visitService.updateLabTest(labTestId, result, status, currentUserId, ipAddress));
    }

    private Long extractUserId(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return jwtUtil.extractUserId(authHeader.substring(7));
        }
        return null;
    }
}
