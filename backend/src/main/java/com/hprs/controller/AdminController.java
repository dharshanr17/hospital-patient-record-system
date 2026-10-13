package com.hprs.controller;

import com.hprs.dto.*;
import com.hprs.security.JwtUtil;
import com.hprs.service.AdminService;
import com.hprs.service.AuditLogService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final AuditLogService auditLogService;
    private final JwtUtil jwtUtil;

    // Hospitals
    @PostMapping("/hospitals")
    public ResponseEntity<HospitalDto> createHospital(@Valid @RequestBody HospitalDto dto, HttpServletRequest request) {
        Long currentUserId = extractUserId(request);
        String ipAddress = request.getRemoteAddr();
        return new ResponseEntity<>(adminService.createHospital(dto, currentUserId, ipAddress), HttpStatus.CREATED);
    }

    @GetMapping("/hospitals")
    public ResponseEntity<List<HospitalDto>> getAllHospitals() {
        return ResponseEntity.ok(adminService.getAllHospitals());
    }

    // Departments
    @PostMapping("/departments")
    public ResponseEntity<DepartmentDto> createDepartment(@Valid @RequestBody DepartmentDto dto, HttpServletRequest request) {
        Long currentUserId = extractUserId(request);
        String ipAddress = request.getRemoteAddr();
        return new ResponseEntity<>(adminService.createDepartment(dto, currentUserId, ipAddress), HttpStatus.CREATED);
    }

    @GetMapping("/departments")
    public ResponseEntity<List<DepartmentDto>> getDepartments(@RequestParam Long hospitalId) {
        return ResponseEntity.ok(adminService.getDepartmentsByHospital(hospitalId));
    }

    // Users
    @PostMapping("/users")
    public ResponseEntity<UserDto> createUser(@Valid @RequestBody UserDto dto, HttpServletRequest request) {
        Long currentUserId = extractUserId(request);
        String ipAddress = request.getRemoteAddr();
        return new ResponseEntity<>(adminService.createUser(dto, currentUserId, ipAddress), HttpStatus.CREATED);
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<UserDto> updateUser(@PathVariable Long id, @RequestBody UserDto dto, HttpServletRequest request) {
        Long currentUserId = extractUserId(request);
        String ipAddress = request.getRemoteAddr();
        return ResponseEntity.ok(adminService.updateUser(id, dto, currentUserId, ipAddress));
    }

    // Audit Logs
    @GetMapping("/audit-logs")
    public ResponseEntity<List<AuditLogDto>> getAuditLogs(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) Long patientId,
            @RequestParam(required = false) String action) {
        if (userId != null || patientId != null || action != null) {
            return ResponseEntity.ok(auditLogService.filterLogs(userId, patientId, action));
        }
        return ResponseEntity.ok(auditLogService.getAllLogs());
    }

    private Long extractUserId(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return jwtUtil.extractUserId(authHeader.substring(7));
        }
        return null;
    }
}
