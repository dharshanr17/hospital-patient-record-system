package com.hprs.repository;

import com.hprs.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByPatient_PatientIdOrderByAppointmentDatetimeDesc(Long patientId);

    @Query("SELECT a FROM Appointment a WHERE " +
           "(:doctorId IS NULL OR a.doctor.userId = :doctorId) AND " +
           "a.appointmentDatetime >= :startOfDay AND " +
           "a.appointmentDatetime <= :endOfDay " +
           "ORDER BY a.appointmentDatetime ASC")
    List<Appointment> findByDoctorAndDateRange(@Param("doctorId") Long doctorId,
                                                @Param("startOfDay") LocalDateTime startOfDay,
                                                @Param("endOfDay") LocalDateTime endOfDay);

    @Query("SELECT a FROM Appointment a WHERE " +
           "a.doctor.userId = :doctorId AND " +
           "a.status != 'CANCELLED' AND " +
           "a.appointmentDatetime = :datetime AND " +
           "(:excludeAppointmentId IS NULL OR a.appointmentId != :excludeAppointmentId)")
    List<Appointment> findConflictingAppointments(@Param("doctorId") Long doctorId,
                                                  @Param("datetime") LocalDateTime datetime,
                                                  @Param("excludeAppointmentId") Long excludeAppointmentId);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE " +
           "a.appointmentDatetime >= :startOfDay AND " +
           "a.appointmentDatetime <= :endOfDay")
    long countAppointmentsForToday(@Param("startOfDay") LocalDateTime startOfDay,
                                   @Param("endOfDay") LocalDateTime endOfDay);

    List<Appointment> findTop10ByOrderByAppointmentDatetimeDesc();
}
