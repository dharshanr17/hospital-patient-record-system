package com.hprs.service;

import com.hprs.dto.PatientDto;
import com.hprs.exception.DuplicateRecordException;
import com.hprs.exception.ResourceNotFoundException;
import com.hprs.model.Patient;
import com.hprs.repository.HospitalRepository;
import com.hprs.repository.PatientRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PatientServiceTest {

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private HospitalRepository hospitalRepository;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private PatientService patientService;

    private Patient samplePatient;
    private PatientDto sampleDto;

    @BeforeEach
    void setUp() {
        samplePatient = Patient.builder()
                .patientId(1L)
                .uhid("UHID-2026-10001")
                .fullName("John Doe")
                .dateOfBirth(LocalDate.of(1985, 6, 15))
                .phone("5551234567")
                .gender("Male")
                .bloodGroup("O+")
                .build();

        sampleDto = PatientDto.builder()
                .fullName("John Doe")
                .dateOfBirth(LocalDate.of(1985, 6, 15))
                .phone("5551234567")
                .gender("Male")
                .bloodGroup("O+")
                .build();
    }

    @Test
    @DisplayName("Should successfully register a new patient and generate UHID")
    void registerPatient_Success() {
        when(patientRepository.findPossibleDuplicates(anyString(), any(), anyString()))
                .thenReturn(Collections.emptyList());
        when(patientRepository.findByUhid(anyString())).thenReturn(Optional.empty());
        when(patientRepository.save(any(Patient.class))).thenReturn(samplePatient);

        PatientDto result = patientService.registerPatient(sampleDto, 1L, "127.0.0.1");

        assertNotNull(result);
        assertEquals("UHID-2026-10001", result.getUhid());
        assertEquals("John Doe", result.getFullName());
        verify(patientRepository, times(1)).save(any(Patient.class));
        verify(auditLogService, times(1)).logAction(eq(1L), eq(1L), eq("CREATE_PATIENT"), anyString(), eq("127.0.0.1"));
    }

    @Test
    @DisplayName("Should throw DuplicateRecordException if matching patient exists")
    void registerPatient_DuplicateError() {
        when(patientRepository.findPossibleDuplicates(anyString(), any(), anyString()))
                .thenReturn(List.of(samplePatient));

        assertThrows(DuplicateRecordException.class, () -> {
            patientService.registerPatient(sampleDto, 1L, "127.0.0.1");
        });

        verify(patientRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should find patient by ID")
    void getPatientById_Success() {
        when(patientRepository.findById(1L)).thenReturn(Optional.of(samplePatient));

        PatientDto result = patientService.getPatientById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getPatientId());
        assertEquals("John Doe", result.getFullName());
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when patient not found")
    void getPatientById_NotFound() {
        when(patientRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            patientService.getPatientById(99L);
        });
    }
}
