package com.meterverse.reporting.shared.interfaces.rest;

import com.meterverse.reporting.billing.domain.model.Invoice;
import com.meterverse.reporting.billing.domain.model.Tariff;
import com.meterverse.reporting.billing.domain.model.TariffSlab;
import com.meterverse.reporting.billing.domain.repository.InvoiceRepository;
import com.meterverse.reporting.billing.domain.repository.TariffRepository;
import com.meterverse.reporting.billing.application.service.BillingCalculator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/billing")
@RequiredArgsConstructor
@Slf4j
public class BillingController {

    private final InvoiceRepository invoiceRepository;
    private final TariffRepository tariffRepository;
    private final BillingCalculator billingCalculator;

    @GetMapping("/invoices")
    public ResponseEntity<Page<Invoice>> getInvoices(
            @RequestParam(required = false) String utilityType,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String customerCode,
            Pageable pageable) {

        Page<Invoice> invoices;
        if (utilityType != null && status != null) {
            invoices = invoiceRepository.findByUtilityTypeAndStatus(utilityType, status, pageable);
        } else if (customerCode != null) {
            invoices = invoiceRepository.findByCustomerCode(customerCode, pageable);
        } else if (utilityType != null) {
            invoices = invoiceRepository.findByUtilityType(utilityType, pageable);
        } else {
            invoices = invoiceRepository.findAll(pageable);
        }
        return ResponseEntity.ok(invoices);
    }

    @GetMapping("/invoices/{id}")
    public ResponseEntity<Invoice> getInvoice(@PathVariable UUID id) {
        return invoiceRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/invoices/by-number/{invoiceNumber}")
    public ResponseEntity<Invoice> getInvoiceByNumber(@PathVariable String invoiceNumber) {
        return invoiceRepository.findByInvoiceNumber(invoiceNumber)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/invoices")
    public ResponseEntity<Invoice> createInvoice(@RequestBody Invoice invoice) {
        Invoice saved = invoiceRepository.save(invoice);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/tariffs")
    public ResponseEntity<List<Tariff>> getAllTariffs() {
        return ResponseEntity.ok(tariffRepository.findAll());
    }

    @GetMapping("/tariffs/active")
    public ResponseEntity<Tariff> getActiveTariff(
            @RequestParam String utilityType,
            @RequestParam(required = false) LocalDate date) {
        LocalDate effectiveDate = date != null ? date : LocalDate.now();
        return tariffRepository.findActiveByUtilityTypeAndDate(utilityType, effectiveDate)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/tariffs")
    public ResponseEntity<Tariff> createTariff(@RequestBody Tariff tariff) {
        Tariff saved = tariffRepository.save(tariff);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/tariffs/{id}")
    public ResponseEntity<Tariff> getTariff(@PathVariable UUID id) {
        return tariffRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/calculate")
    public ResponseEntity<Map<String, Object>> calculateCharges(@RequestBody Map<String, Object> request) {
        double consumption = Double.parseDouble(request.get("consumption").toString());
        String utilityType = (String) request.get("utilityType");

        Optional<Tariff> tariffOpt = tariffRepository.findActiveByUtilityTypeAndDate(utilityType, LocalDate.now());
        if (tariffOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No active tariff found"));
        }

        Tariff tariff = tariffOpt.get();
        List<TariffSlab> slabs = List.of();

        BillingCalculator.SlabResult slabResult = billingCalculator.applySlabs(consumption, slabs);
        BigDecimal total = slabResult.energyCharges().add(slabResult.fixedCharges());
        BigDecimal tax = billingCalculator.calculateTax(total, utilityType);
        BigDecimal grandTotal = total.add(tax);

        return ResponseEntity.ok(Map.of(
                "utilityType", utilityType,
                "consumption", consumption,
                "energyCharges", slabResult.energyCharges(),
                "fixedCharges", slabResult.fixedCharges(),
                "totalCharges", total,
                "taxAmount", tax,
                "totalAmount", grandTotal,
                "currency", "SAR"
        ));
    }
}
