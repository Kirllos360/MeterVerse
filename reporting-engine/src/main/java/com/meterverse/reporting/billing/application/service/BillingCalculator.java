package com.meterverse.reporting.billing.application.service;

import com.meterverse.reporting.billing.domain.model.InvoiceChargeLine;
import com.meterverse.reporting.billing.domain.model.TariffSlab;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.List;

@Service
@Slf4j
public class BillingCalculator {

    private static final BigDecimal DEFAULT_VAT_RATE = new BigDecimal("0.15");
    private static final BigDecimal DEFAULT_TAX_RATE = new BigDecimal("0.00");

    public BigDecimal calculateTotal(List<InvoiceChargeLine> chargeLines) {
        if (chargeLines == null || chargeLines.isEmpty()) {
            return BigDecimal.ZERO;
        }
        return chargeLines.stream()
                .map(InvoiceChargeLine::getLineAmount)
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);
    }

    public BigDecimal calculateTax(BigDecimal subtotal, String utilityType) {
        if (subtotal == null || subtotal.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        BigDecimal vatRate;
        if ("ELECTRICITY".equalsIgnoreCase(utilityType) || "WATER".equalsIgnoreCase(utilityType)) {
            vatRate = DEFAULT_VAT_RATE;
        } else {
            vatRate = DEFAULT_TAX_RATE;
        }
        BigDecimal tax = subtotal.multiply(vatRate).setScale(2, RoundingMode.HALF_UP);
        log.debug("Calculated tax {} for subtotal {} at rate {}", tax, subtotal, vatRate);
        return tax;
    }

    public SlabResult applySlabs(double consumption, List<TariffSlab> slabs) {
        if (slabs == null || slabs.isEmpty()) {
            return new SlabResult(BigDecimal.ZERO, BigDecimal.ZERO, 0.0);
        }
        slabs.sort(Comparator.comparingDouble(TariffSlab::getFromUnit));

        BigDecimal totalCharges = BigDecimal.ZERO;
        BigDecimal totalFixed = BigDecimal.ZERO;
        double remaining = consumption;

        for (TariffSlab slab : slabs) {
            if (remaining <= 0) break;

            double slabUnits;
            if (slab.getToUnit() == null) {
                slabUnits = remaining;
            } else {
                double slabRange = slab.getToUnit() - slab.getFromUnit();
                slabUnits = Math.min(remaining, slabRange);
            }

            if (slabUnits <= 0) continue;

            BigDecimal charge = BigDecimal.valueOf(slabUnits)
                    .multiply(BigDecimal.valueOf(slab.getRate()))
                    .setScale(4, RoundingMode.HALF_UP);
            totalCharges = totalCharges.add(charge);

            if (slab.getFixedCharge() > 0) {
                totalFixed = totalFixed.add(BigDecimal.valueOf(slab.getFixedCharge()));
            }

            remaining -= slabUnits;
        }

        log.debug("Slab calculation: consumption={}, charges={}, fixed={}, unchecked={}",
                consumption, totalCharges, totalFixed, remaining);
        return new SlabResult(totalCharges, totalFixed, remaining);
    }

    public record SlabResult(BigDecimal energyCharges, BigDecimal fixedCharges, double uncheckedConsumption) {}
}
