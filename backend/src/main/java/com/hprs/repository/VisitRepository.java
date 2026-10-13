package com.hprs.repository;

import com.hprs.model.Visit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VisitRepository extends JpaRepository<Visit, Long> {

    List<Visit> findByPatient_PatientIdOrderByVisitDateDesc(Long patientId);

    List<Visit> findTop10ByOrderByVisitDateDesc();
}
