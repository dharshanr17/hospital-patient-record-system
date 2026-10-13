package com.hprs.service;

import com.hprs.dto.AppointmentDto;
import com.hprs.exception.SlotConflictException;
import com.hprs.model.Appointment;
import com.hprs.model.Hospital;
import com.hprs.model.Patient;
import com.hprs.model.User;
import com.hprs.repository.AppointmentRepository;
import com.hprs.repository.HospitalRepository;
import com.hprs.repository.PatientRepository;
import com.hprs.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AppointmentServiceTest {

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private HospitalRepository hospitalRepository;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private AppointmentService appointmentService;

    private Patient samplePatient;
    private User sampleDoctor;
    private Hospital sampleHospital;
    private Appointment sampleAppointment;
    private AppointmentDto sampleDto;

    @BeforeEach
    void setUp() {
        samplePatient = Patient.builder().patientId(1L).fullName("John Doe").uhid("UHID-101").phone("5551234").build();
        sampleDoctor = User.builder().userId(2L).fullName("Dr. Emily Carter").role(User.Role.DOCTOR).specialization("Cardiology").build();
        sampleHospital = Hospital.builder().hospitalId(1L).name("Global City Hospital").build();

        LocalDateTime apptTime = LocalDateTime.now().plusDays(1);

        sampleAppointment = Appointment.builder()
                .appointmentId(10L)
                .patient(samplePatient)
                .doctor(sampleDoctor)
                .hospital(sampleHospital)
                .appointmentDatetime(apptTime)
                .reason("Chest Pain")
                .status(Appointment.Status.SCHEDULED)
                .build();

        sampleDto = AppointmentDto.builder()
                .patientId(1L)
                .doctorId(2L)
                .hospitalId(1L)
                .appointmentDatetime(apptTime)
                .reason("Chest Pain")
                .build();
    }

    @Test
    @DisplayName("Should successfully create appointment when slot is available")
    void createAppointment_Success() {
        when(appointmentRepository.findConflictingAppointments(eq(2L), any(), any()))
                .thenReturn(Collections.emptyList());
        when(patientRepository.findById(1L)).thenReturn(Optional.of(samplePatient));
        when(userRepository.findById(2L)).thenReturn(Optional.of(sampleDoctor));
        when(hospitalRepository.findById(1L)).thenReturn(Optional.of(sampleHospital));
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(sampleAppointment);

        AppointmentDto result = appointmentService.createAppointment(sampleDto, 1L, "127.0.0.1");

        assertNotNull(result);
        assertEquals(10L, result.getAppointmentId());
        assertEquals("SCHEDULED", result.getStatus());
        verify(appointmentRepository, times(1)).save(any(Appointment.class));
    }

    @Test
    @DisplayName("Should throw SlotConflictException when doctor has double booking")
    void createAppointment_SlotConflict() {
        when(appointmentRepository.findConflictingAppointments(eq(2L), any(), any()))
                .thenReturn(List.of(sampleAppointment));

        assertThrows(SlotConflictException.class, () -> {
            appointmentService.createAppointment(sampleDto, 1L, "127.0.0.1");
        });

        verify(appointmentRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should update appointment status to CANCELLED")
    void cancelAppointment_Success() {
        when(appointmentRepository.findById(10L)).thenReturn(Optional.of(sampleAppointment));

        appointmentService.cancelAppointment(10L, 1L, "127.0.0.1");

        assertEquals(Appointment.Status.CANCELLED, sampleAppointment.getStatus());
        verify(appointmentRepository, times(1)).save(sampleAppointment);
    }
}
