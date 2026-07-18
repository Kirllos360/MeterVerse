package com.meterverse.reporting.billing.domain.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "invoices")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "invoice_number", unique = true)
    private String invoiceNumber;

    @Column(name = "invoice_title")
    private String invoiceTitle;

    @Column(name = "utility_type")
    private String utilityType;

    @Column(name = "status")
    private String status;

    @Column(name = "customer_id")
    private UUID customerId;

    @Column(name = "customer_code")
    private String customerCode;

    @Column(name = "customer_name")
    private String customerName;

    @Column(name = "customer_name_ar")
    private String customerNameAr;

    @Column(name = "meter_serial")
    private String meterSerial;

    @Column(name = "meter_type")
    private String meterType;

    @Column(name = "project_name")
    private String projectName;

    @Column(name = "area_name")
    private String areaName;

    @Column(name = "unit_number")
    private String unitNumber;

    @Column(name = "address")
    private String address;

    @Column(name = "issue_date")
    private LocalDate issueDate;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "billing_period")
    private String billingPeriod;

    @Column(name = "start_reading")
    private Double startReading;

    @Column(name = "end_reading")
    private Double endReading;

    @Column(name = "consumption")
    private Double consumption;

    @Column(name = "unit_label")
    private String unitLabel;

    @Column(name = "balance_before")
    private BigDecimal balanceBefore;

    @Column(name = "current_charges")
    private BigDecimal currentCharges;

    @Column(name = "adjustments")
    private BigDecimal adjustments;

    @Column(name = "payments")
    private BigDecimal payments;

    @Column(name = "balance_after")
    private BigDecimal balanceAfter;

    @Column(name = "subtotal")
    private BigDecimal subtotal;

    @Column(name = "tax_amount")
    private BigDecimal taxAmount;

    @Column(name = "total_amount")
    private BigDecimal totalAmount;

    @Column(name = "currency")
    private String currency;

    @Column(name = "company_name")
    private String companyName;

    @Column(name = "company_name_ar")
    private String companyNameAr;

    @Column(name = "company_license")
    private String companyLicense;

    @Column(name = "language")
    @Builder.Default
    private String language = "ar";

    @Column(name = "generated_at")
    private Instant generatedAt;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
        if (invoiceNumber == null) {
            invoiceNumber = "INV-" + System.currentTimeMillis();
        }
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }
}
