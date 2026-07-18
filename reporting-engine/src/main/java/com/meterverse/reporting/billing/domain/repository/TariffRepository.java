package com.meterverse.reporting.billing.domain.repository;

import com.meterverse.reporting.billing.domain.model.Tariff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TariffRepository extends JpaRepository<Tariff, UUID> {

    @Query("SELECT t FROM Tariff t WHERE t.utilityType = :utilityType " +
           "AND t.isActive = true " +
           "AND t.effectiveFrom <= :date " +
           "AND (t.effectiveTo IS NULL OR t.effectiveTo >= :date)")
    Optional<Tariff> findActiveByUtilityTypeAndDate(
            @Param("utilityType") String utilityType,
            @Param("date") LocalDate date);

    Optional<Tariff> findByCode(String code);
}
