package com.hprs.repository;

import com.hprs.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    List<AuditLog> findTop50ByOrderByTimestampDesc();

    @Query("SELECT a FROM AuditLog a WHERE " +
           "(:userId IS NULL OR a.user.userId = :userId) AND " +
           "(:patientId IS NULL OR a.patient.patientId = :patientId) AND " +
           "(:action IS NULL OR LOWER(a.action) LIKE LOWER(CONCAT('%', :action, '%'))) " +
           "ORDER BY a.timestamp DESC")
    List<AuditLog> filterAuditLogs(@Param("userId") Long userId,
                                   @Param("patientId") Long patientId,
                                   @Param("action") String action);
}
