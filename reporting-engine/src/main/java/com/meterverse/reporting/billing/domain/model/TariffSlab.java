package com.meterverse.reporting.billing.domain.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "tariff_slabs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TariffSlab {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "tariff_id", nullable = false, insertable = false, updatable = false)
    private UUID tariffId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tariff_id", nullable = false)
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Tariff tariff;

    @Column(name = "from_unit", nullable = false)
    private double fromUnit;

    @Column(name = "to_unit")
    private Double toUnit;

    @Column(nullable = false)
    private double rate;

    @Column(name = "fixed_charge")
    @Builder.Default
    private double fixedCharge = 0.0;

    @Column(nullable = false)
    @Builder.Default
    private String currency = "SAR";
}
