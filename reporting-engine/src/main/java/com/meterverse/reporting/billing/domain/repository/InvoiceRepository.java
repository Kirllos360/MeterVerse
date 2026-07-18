package com.meterverse.reporting.billing.domain.repository;

import com.meterverse.reporting.billing.domain.model.Invoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {

    Page<Invoice> findByUtilityTypeAndStatus(String utilityType, String status, Pageable pageable);

    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);

    Page<Invoice> findByCustomerCode(String customerCode, Pageable pageable);

    Page<Invoice> findByUtilityType(String utilityType, Pageable pageable);
}
