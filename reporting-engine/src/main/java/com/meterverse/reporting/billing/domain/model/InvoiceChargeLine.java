package com.meterverse.reporting.billing.domain.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "invoice_charge_lines")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceChargeLine {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "invoice_id", nullable = false, insertable = false, updatable = false)
    private UUID invoiceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", nullable = false)
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Invoice invoice;

    @Column(name = "charge_code")
    private String chargeCode;

    @Column(name = "charge_name")
    private String chargeName;

    @Column(name = "charge_name_ar")
    private String chargeNameAr;

    @Column(name = "charge_group")
    private int chargeGroup;

    @Column(name = "quantity")
    private double quantity;

    @Column(name = "rate_amount", precision = 18, scale = 6)
    private BigDecimal rateAmount;

    @Column(name = "line_amount", precision = 18, scale = 6)
    private BigDecimal lineAmount;
}
