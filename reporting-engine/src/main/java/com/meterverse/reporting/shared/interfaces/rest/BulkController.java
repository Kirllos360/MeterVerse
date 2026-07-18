package com.meterverse.reporting.shared.interfaces.rest;

import com.meterverse.reporting.bulk.domain.BulkJob;
import com.meterverse.reporting.bulk.domain.BulkJobItem;
import com.meterverse.reporting.bulk.application.BulkGenerationService;
import com.meterverse.reporting.reportengine.domain.ReportFormat;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/bulk")
@RequiredArgsConstructor
@Slf4j
public class BulkController {

    private final BulkGenerationService bulkGenerationService;

    @PostMapping("/jobs")
    public ResponseEntity<BulkJob> createJob(@RequestBody Map<String, Object> request) {
        String utilityType = (String) request.get("utilityType");
        ReportFormat format = ReportFormat.valueOf((String) request.get("format"));
        @SuppressWarnings("unchecked")
        List<String> invoiceIdStrings = (List<String>) request.get("invoiceIds");
        List<UUID> invoiceIds = invoiceIdStrings.stream().map(UUID::fromString).toList();
        String createdBy = (String) request.getOrDefault("createdBy", "system");

        BulkJob job = bulkGenerationService.createJob(utilityType, format, invoiceIds, createdBy);
        return ResponseEntity.ok(job);
    }

    @GetMapping("/jobs/{jobId}")
    public ResponseEntity<BulkJob> getJobStatus(@PathVariable UUID jobId) {
        return ResponseEntity.ok(bulkGenerationService.getJobStatus(jobId));
    }

    @GetMapping("/jobs/{jobId}/results")
    public ResponseEntity<List<BulkJobItem>> getJobResults(@PathVariable UUID jobId) {
        return ResponseEntity.ok(bulkGenerationService.getJobResults(jobId));
    }

    @GetMapping("/jobs/{jobId}/items/{itemId}/download")
    public ResponseEntity<byte[]> downloadItemResult(
            @PathVariable UUID jobId,
            @PathVariable UUID itemId) {
        byte[] result = bulkGenerationService.getJobItemResult(itemId);
        if (result == null || result.length == 0) {
            return ResponseEntity.noContent().build();
        }
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", "report_" + itemId + ".pdf");
        return ResponseEntity.ok().headers(headers).body(result);
    }

    @PostMapping("/jobs/{jobId}/process")
    public ResponseEntity<Void> processJob(@PathVariable UUID jobId) {
        bulkGenerationService.processJob(jobId);
        return ResponseEntity.accepted().build();
    }

    @PostMapping("/jobs/{jobId}/cancel")
    public ResponseEntity<Void> cancelJob(@PathVariable UUID jobId) {
        bulkGenerationService.cancelJob(jobId);
        return ResponseEntity.ok().build();
    }
}
