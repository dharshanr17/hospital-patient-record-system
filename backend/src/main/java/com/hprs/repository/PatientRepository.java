package com.hprs.repository;

import com.hprs.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {

    Optional<Patient> findByUhid(String uhid);

    @Query("SELECT p FROM Patient p WHERE " +
           "LOWER(p.fullName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.phone) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.uhid) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Patient> searchPatients(@Param("query") String query);

    @Query("SELECT p FROM Patient p WHERE " +
           "LOWER(p.fullName) = LOWER(:fullName) AND " +
           "p.dateOfBirth = :dateOfBirth AND " +
           "p.phone = :phone")
    List<Patient> findPossibleDuplicates(@Param("fullName") String fullName,
                                         @Param("dateOfBirth") LocalDate dateOfBirth,
                                         @Param("phone") String phone);

    @Query("SELECT COUNT(p) FROM Patient p")
    long countAllPatients();
}
