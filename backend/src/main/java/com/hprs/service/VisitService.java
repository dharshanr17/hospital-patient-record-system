package com.hprs.service;

import com.hprs.dto.LabTestDto;
import com.hprs.dto.PrescriptionDto;
import com.hprs.dto.VisitDto;
import com.hprs.exception.ResourceNotFoundException;
import com.hprs.model.*;
import com.hprs.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VisitService {

    private final VisitRepository visitRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final HospitalRepository hospitalRepository;
    private final AppointmentRepository appointmentRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final LabTestRepository labTestRepository;
    private final AuditLogService auditLogService;

    @Transactional
    public VisitDto recordVisit(VisitDto dto, Long currentUserId, String ipAddress) {
        Patient patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + dto.getPatientId()));
        User doctor = userRepository.findById(dto.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + dto.getDoctorId()));
        Hospital hospital = hospitalRepository.findById(dto.getHospitalId())
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found with id: " + dto.getHospitalId()));

        Appointment appointment = null;
        if (dto.getAppointmentId() != null) {
            appointment = appointmentRepository.findById(dto.getAppointmentId()).orElse(null);
            if (appointment != null) {
                appointment.setStatus(Appointment.Status.COMPLETED);
                appointmentRepository.save(appointment);
            }
        }

        Visit visit = Visit.builder()
                .patient(patient)
                .doctor(doctor)
                .hospital(hospital)
                .appointment(appointment)
                .visitDate(dto.getVisitDate() != null ? dto.getVisitDate() : LocalDateTime.now())
                .symptoms(dto.getSymptoms())
                .vitals(dto.getVitals())
                .diagnosis(dto.getDiagnosis())
                .notes(dto.getNotes())
                .build();

        Visit savedVisit = visitRepository.save(visit);

        // Save Prescriptions
        List<PrescriptionDto> savedPrescriptions = new ArrayList<>();
        if (dto.getPrescriptions() != null) {
            for (PrescriptionDto pDto : dto.getPrescriptions()) {
                Prescription p = Prescription.builder()
                        .visit(savedVisit)
                        .medicineName(pDto.getMedicineName())
                        .dosage(pDto.getDosage())
                        .frequency(pDto.getFrequency())
                        .duration(pDto.getDuration())
                        .instructions(pDto.getInstructions())
                        .build();
                Prescription savedP = prescriptionRepository.save(p);
                savedPrescriptions.add(mapPrescriptionToDto(savedP));
            }
        }

        // Save Lab Tests
        List<LabTestDto> savedLabTests = new ArrayList<>();
        if (dto.getLabTests() != null) {
            for (LabTestDto ltDto : dto.getLabTests()) {
                LabTest lt = LabTest.builder()
                        .visit(savedVisit)
                        .testName(ltDto.getTestName())
                        .result(ltDto.getResult())
                        .status(LabTest.Status.ORDERED)
                        .build();
                LabTest savedLt = labTestRepository.save(lt);
                savedLabTests.add(mapLabTestToDto(savedLt));
            }
        }

        auditLogService.logAction(currentUserId, patient.getPatientId(), "RECORD_VISIT",
                "Recorded visit #" + savedVisit.getVisitId() + " with diagnosis: " + savedVisit.getDiagnosis(), ipAddress);

        VisitDto response = mapToDto(savedVisit);
        response.setPrescriptions(savedPrescriptions);
        response.setLabTests(savedLabTests);
        return response;
    }

    @Transactional(readOnly = true)
    public List<VisitDto> getPatientVisits(Long patientId) {
        return visitRepository.findByPatient_PatientIdOrderByVisitDateDesc(patientId).stream()
                .map(this::mapToDtoWithDetails)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public VisitDto getVisitById(Long visitId) {
        Visit visit = visitRepository.findById(visitId)
                .orElseThrow(() -> new ResourceNotFoundException("Visit not found with id: " + visitId));
        return mapToDtoWithDetails(visit);
    }

    @Transactional
    public List<PrescriptionDto> addPrescriptions(Long visitId, List<PrescriptionDto> dtos, Long currentUserId, String ipAddress) {
        Visit visit = visitRepository.findById(visitId)
                .orElseThrow(() -> new ResourceNotFoundException("Visit not found with id: " + visitId));

        List<PrescriptionDto> result = new ArrayList<>();
        for (PrescriptionDto pDto : dtos) {
            Prescription p = Prescription.builder()
                    .visit(visit)
                    .medicineName(pDto.getMedicineName())
                    .dosage(pDto.getDosage())
                    .frequency(pDto.getFrequency())
                    .duration(pDto.getDuration())
                    .instructions(pDto.getInstructions())
                    .build();
            Prescription savedP = prescriptionRepository.save(p);
            result.add(mapPrescriptionToDto(savedP));
        }

        auditLogService.logAction(currentUserId, visit.getPatient().getPatientId(), "ADD_PRESCRIPTION",
                "Added " + dtos.size() + " prescription items to visit #" + visitId, ipAddress);

        return result;
    }

    @Transactional
    public List<LabTestDto> addLabTests(Long visitId, List<LabTestDto> dtos, Long currentUserId, String ipAddress) {
        Visit visit = visitRepository.findById(visitId)
                .orElseThrow(() -> new ResourceNotFoundException("Visit not found with id: " + visitId));

        List<LabTestDto> result = new ArrayList<>();
        for (LabTestDto ltDto : dtos) {
            LabTest lt = LabTest.builder()
                    .visit(visit)
                    .testName(ltDto.getTestName())
                    .result(ltDto.getResult())
                    .status(LabTest.Status.ORDERED)
                    .build();
            LabTest savedLt = labTestRepository.save(lt);
            result.add(mapLabTestToDto(savedLt));
        }

        auditLogService.logAction(currentUserId, visit.getPatient().getPatientId(), "ORDER_LAB_TEST",
                "Ordered " + dtos.size() + " lab tests for visit #" + visitId, ipAddress);

        return result;
    }

    @Transactional
    public LabTestDto updateLabTest(Long labTestId, String resultText, String statusStr, Long currentUserId, String ipAddress) {
        LabTest labTest = labTestRepository.findById(labTestId)
                .orElseThrow(() -> new ResourceNotFoundException("Lab test not found with id: " + labTestId));

        if (resultText != null) {
            labTest.setResult(resultText);
        }
        if (statusStr != null) {
            labTest.setStatus(LabTest.Status.valueOf(statusStr.toUpperCase()));
        }

        LabTest updated = labTestRepository.save(labTest);
        auditLogService.logAction(currentUserId, labTest.getVisit().getPatient().getPatientId(), "UPDATE_LAB_TEST",
                "Updated lab test #" + labTestId + " (" + updated.getTestName() + ") status to " + updated.getStatus(), ipAddress);

        return mapLabTestToDto(updated);
    }

    public VisitDto mapToDto(Visit v) {
        return VisitDto.builder()
                .visitId(v.getVisitId())
                .patientId(v.getPatient().getPatientId())
                .patientName(v.getPatient().getFullName())
                .patientUhid(v.getPatient().getUhid())
                .doctorId(v.getDoctor().getUserId())
                .doctorName(v.getDoctor().getFullName())
                .hospitalId(v.getHospital().getHospitalId())
                .hospitalName(v.getHospital().getName())
                .appointmentId(v.getAppointment() != null ? v.getAppointment().getAppointmentId() : null)
                .visitDate(v.getVisitDate())
                .symptoms(v.getSymptoms())
                .vitals(v.getVitals())
                .diagnosis(v.getDiagnosis())
                .notes(v.getNotes())
                .build();
    }

    public VisitDto mapToDtoWithDetails(Visit v) {
        VisitDto dto = mapToDto(v);
        dto.setPrescriptions(prescriptionRepository.findByVisit_VisitId(v.getVisitId()).stream()
                .map(this::mapPrescriptionToDto).collect(Collectors.toList()));
        dto.setLabTests(labTestRepository.findByVisit_VisitId(v.getVisitId()).stream()
                .map(this::mapLabTestToDto).collect(Collectors.toList()));
        return dto;
    }

    private PrescriptionDto mapPrescriptionToDto(Prescription p) {
        return PrescriptionDto.builder()
                .prescriptionId(p.getPrescriptionId())
                .visitId(p.getVisit().getVisitId())
                .medicineName(p.getMedicineName())
                .dosage(p.getDosage())
                .frequency(p.getFrequency())
                .duration(p.getDuration())
                .instructions(p.getInstructions())
                .build();
    }

    private LabTestDto mapLabTestToDto(LabTest lt) {
        return LabTestDto.builder()
                .labTestId(lt.getLabTestId())
                .visitId(lt.getVisit().getVisitId())
                .testName(lt.getTestName())
                .result(lt.getResult())
                .status(lt.getStatus().name())
                .build();
    }
}
