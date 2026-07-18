package com.meterverse.reporting.templatemanager.domain.repository;

import com.meterverse.reporting.templatemanager.domain.ReportTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReportTemplateRepository extends JpaRepository<ReportTemplate, UUID> {

    Optional<ReportTemplate> findByCode(String code);

    List<ReportTemplate> findByUtilityTypeAndIsActive(String utilityType, boolean isActive);

    List<ReportTemplate> findByIsActive(boolean isActive);

    @Query("SELECT t FROM ReportTemplate t WHERE " +
           "(:utilityType IS NULL OR t.utilityType = :utilityType) AND t.isActive = true")
    List<ReportTemplate> findActiveByUtilityType(@Param("utilityType") String utilityType);

    boolean existsByCode(String code);
}
