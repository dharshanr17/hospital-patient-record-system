package com.hprs.service;

import com.hprs.dto.PatientDto;
import com.hprs.exception.DuplicateRecordException;
import com.hprs.exception.ResourceNotFoundException;
import com.hprs.model.Hospital;
import com.hprs.model.Patient;
import com.hprs.repository.HospitalRepository;
import com.hprs.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Year;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;
    private final HospitalRepository hospitalRepository;
    private final AuditLogService auditLogService;

    @Transactional
    public PatientDto registerPatient(PatientDto dto, Long currentUserId, String ipAddress) {
        // Duplicate patient check
        if (dto.getDateOfBirth() != null && dto.getPhone() != null && !dto.getPhone().isBlank()) {
            List<Patient> duplicates = patientRepository.findPossibleDuplicates(
                    dto.getFullName().trim(),
                    dto.getDateOfBirth(),
                    dto.getPhone().trim()
            );
            if (!duplicates.isEmpty()) {
                throw new DuplicateRecordException("A patient with the same Name, DOB, and Phone already exists (UHID: " + duplicates.get(0).getUhid() + ")");
            }
        }

        // Generate unique UHID
        String uhid = generateUniqueUhid();

        Hospital hospital = null;
        if (dto.getRegisteredHospitalId() != null) {
            hospital = hospitalRepository.findById(dto.getRegisteredHospitalId()).orElse(null);
        }

        Patient patient = Patient.builder()
                .uhid(uhid)
                .fullName(dto.getFullName().trim())
                .dateOfBirth(dto.getDateOfBirth())
                .gender(dto.getGender())
                .phone(dto.getPhone() != null ? dto.getPhone().trim() : null)
                .email(dto.getEmail() != null ? dto.getEmail().trim() : null)
                .address(dto.getAddress())
                .bloodGroup(dto.getBloodGroup())
                .allergies(dto.getAllergies())
                .emergencyContactName(dto.getEmergencyContactName())
                .emergencyContactPhone(dto.getEmergencyContactPhone())
                .registeredHospital(hospital)
                .build();

        Patient saved = patientRepository.save(patient);

        auditLogService.logAction(currentUserId, saved.getPatientId(), "CREATE_PATIENT",
                "Registered new patient with UHID: " + saved.getUhid(), ipAddress);

        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<PatientDto> searchPatients(String query) {
        if (query == null || query.isBlank()) {
            return patientRepository.findAll().stream().limit(50).map(this::mapToDto).collect(Collectors.toList());
        }
        return patientRepository.searchPatients(query.trim()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PatientDto getPatientById(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + id));
        return mapToDto(patient);
    }

    @Transactional(readOnly = true)
    public PatientDto getPatientByUhid(String uhid) {
        Patient patient = patientRepository.findByUhid(uhid)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with UHID: " + uhid));
        return mapToDto(patient);
    }

    @Transactional(readOnly = true)
    public List<PatientDto> checkDuplicates(String fullName, LocalDate dob, String phone) {
        return patientRepository.findPossibleDuplicates(fullName.trim(), dob, phone.trim()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public PatientDto updatePatient(Long id, PatientDto dto, Long currentUserId, String ipAddress) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + id));

        patient.setFullName(dto.getFullName().trim());
        patient.setDateOfBirth(dto.getDateOfBirth());
        patient.setGender(dto.getGender());
        patient.setPhone(dto.getPhone() != null ? dto.getPhone().trim() : null);
        patient.setEmail(dto.getEmail() != null ? dto.getEmail().trim() : null);
        patient.setAddress(dto.getAddress());
        patient.setBloodGroup(dto.getBloodGroup());
        patient.setAllergies(dto.getAllergies());
        patient.setEmergencyContactName(dto.getEmergencyContactName());
        patient.setEmergencyContactPhone(dto.getEmergencyContactPhone());

        Patient updated = patientRepository.save(patient);

        auditLogService.logAction(currentUserId, updated.getPatientId(), "UPDATE_PATIENT",
                "Updated patient details for UHID: " + updated.getUhid(), ipAddress);

        return mapToDto(updated);
    }

    private String generateUniqueUhid() {
        int year = Year.now().getValue();
        Random random = new Random();
        String candidate;
        do {
            int randomNum = 10000 + random.nextInt(90000);
            candidate = String.format("UHID-%d-%d", year, randomNum);
        } while (patientRepository.findByUhid(candidate).isPresent());
        return candidate;
    }

    public PatientDto mapToDto(Patient p) {
        return PatientDto.builder()
                .patientId(p.getPatientId())
                .uhid(p.getUhid())
                .fullName(p.getFullName())
                .dateOfBirth(p.getDateOfBirth())
                .gender(p.getGender())
                .phone(p.getPhone())
                .email(p.getEmail())
                .address(p.getAddress())
                .bloodGroup(p.getBloodGroup())
                .allergies(p.getAllergies())
                .emergencyContactName(p.getEmergencyContactName())
                .emergencyContactPhone(p.getEmergencyContactPhone())
                .registeredHospitalId(p.getRegisteredHospital() != null ? p.getRegisteredHospital().getHospitalId() : null)
                .registeredHospitalName(p.getRegisteredHospital() != null ? p.getRegisteredHospital().getName() : null)
                .createdAt(p.getCreatedAt())
                .build();
    }
}
