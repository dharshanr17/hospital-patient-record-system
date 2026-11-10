package com.hprs.service;

import com.hprs.dto.AppointmentDto;
import com.hprs.exception.ResourceNotFoundException;
import com.hprs.exception.SlotConflictException;
import com.hprs.model.Appointment;
import com.hprs.model.Hospital;
import com.hprs.model.Patient;
import com.hprs.model.User;
import com.hprs.repository.AppointmentRepository;
import com.hprs.repository.HospitalRepository;
import com.hprs.repository.PatientRepository;
import com.hprs.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final HospitalRepository hospitalRepository;
    private final AuditLogService auditLogService;

    @Transactional
    public AppointmentDto createAppointment(AppointmentDto dto, Long currentUserId, String ipAddress) {
        // Check doctor conflict
        List<Appointment> conflicts = appointmentRepository.findConflictingAppointments(
                dto.getDoctorId(), dto.getAppointmentDatetime(), null);
        if (!conflicts.isEmpty()) {
            throw new SlotConflictException("Doctor already has an appointment booked at " + dto.getAppointmentDatetime());
        }

        Patient patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + dto.getPatientId()));
        User doctor = userRepository.findById(dto.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + dto.getDoctorId()));
        Hospital hospital = hospitalRepository.findById(dto.getHospitalId())
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found with id: " + dto.getHospitalId()));

        Appointment appointment = Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .hospital(hospital)
                .appointmentDatetime(dto.getAppointmentDatetime())
                .reason(dto.getReason())
                .status(Appointment.Status.SCHEDULED)
                .build();

        Appointment saved = appointmentRepository.save(appointment);

        auditLogService.logAction(currentUserId, patient.getPatientId(), "CREATE_APPOINTMENT",
                "Scheduled appointment ID #" + saved.getAppointmentId() + " with Dr. " + doctor.getFullName(), ipAddress);

        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<AppointmentDto> getAppointmentsForDate(Long doctorId, LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);
        return appointmentRepository.findByDoctorAndDateRange(doctorId, startOfDay, endOfDay).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AppointmentDto> getPatientAppointments(Long patientId) {
        return appointmentRepository.findByPatient_PatientIdOrderByAppointmentDatetimeDesc(patientId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public AppointmentDto updateAppointmentStatus(Long id, String statusStr, LocalDateTime newTime, Long currentUserId, String ipAddress) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));

        if (newTime != null && !newTime.equals(appointment.getAppointmentDatetime())) {
            List<Appointment> conflicts = appointmentRepository.findConflictingAppointments(
                    appointment.getDoctor().getUserId(), newTime, id);
            if (!conflicts.isEmpty()) {
                throw new SlotConflictException("Doctor already has an appointment booked at " + newTime);
            }
            appointment.setAppointmentDatetime(newTime);
        }

        if (statusStr != null) {
            appointment.setStatus(Appointment.Status.valueOf(statusStr.toUpperCase()));
        }

        Appointment updated = appointmentRepository.save(appointment);

        auditLogService.logAction(currentUserId, appointment.getPatient().getPatientId(), "UPDATE_APPOINTMENT",
                "Updated appointment #" + id + " status to " + appointment.getStatus(), ipAddress);

        return mapToDto(updated);
    }

    @Transactional
    public void cancelAppointment(Long id, Long currentUserId, String ipAddress) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));
        appointment.setStatus(Appointment.Status.CANCELLED);
        appointmentRepository.save(appointment);

        auditLogService.logAction(currentUserId, appointment.getPatient().getPatientId(), "CANCEL_APPOINTMENT",
                "Cancelled appointment #" + id, ipAddress);
    }

    public AppointmentDto mapToDto(Appointment a) {
        return AppointmentDto.builder()
                .appointmentId(a.getAppointmentId())
                .patientId(a.getPatient().getPatientId())
                .patientName(a.getPatient().getFullName())
                .patientUhid(a.getPatient().getUhid())
                .patientPhone(a.getPatient().getPhone())
                .doctorId(a.getDoctor().getUserId())
                .doctorName(a.getDoctor().getFullName())
                .doctorSpecialization(a.getDoctor().getSpecialization())
                .hospitalId(a.getHospital().getHospitalId())
                .hospitalName(a.getHospital().getName())
                .appointmentDatetime(a.getAppointmentDatetime())
                .reason(a.getReason())
                .status(a.getStatus().name())
                .createdAt(a.getCreatedAt())
                .build();
    }
}
