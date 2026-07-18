package com.meterverse.reporting.shared.interfaces.rest;

import com.meterverse.reporting.reportengine.domain.ReportFormat;
import com.meterverse.reporting.reportengine.domain.ReportRequest;
import com.meterverse.reporting.reportengine.domain.ReportResult;
import com.meterverse.reporting.reportengine.application.ReportService;
import com.meterverse.reporting.templatemanager.domain.ReportTemplate;
import com.meterverse.reporting.templatemanager.domain.repository.ReportTemplateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Slf4j
public class ReportController {

    private final ReportService reportService;
    private final ReportTemplateRepository templateRepository;

    @PostMapping("/generate")
    public ResponseEntity<byte[]> generateReport(@RequestBody ReportRequest request) {
        log.info("REST request to generate report: {} in format {}", request.getReportName(), request.getFormat());
        ReportResult result = reportService.generateReport(request);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(result.getMimeType()));
        headers.setContentDispositionFormData("attachment", result.suggestedFileName());
        headers.setContentLength(result.getFileSize());

        return ResponseEntity.ok()
                .headers(headers)
                .body(result.getBytes());
    }

    @PostMapping("/batch")
    public ResponseEntity<List<ReportResult>> generateBatch(@RequestBody List<ReportRequest> requests) {
        log.info("REST request to generate batch of {} reports", requests.size());
        List<ReportResult> results = reportService.generateBatch(requests);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/formats")
    public ResponseEntity<Set<ReportFormat>> getSupportedFormats() {
        return ResponseEntity.ok(ReportFormat.supportedFormats());
    }

    @GetMapping("/templates")
    public ResponseEntity<List<ReportTemplate>> listTemplates(
            @RequestParam(required = false) String utilityType) {
        List<ReportTemplate> templates;
        if (utilityType != null) {
            templates = templateRepository.findByUtilityTypeAndIsActive(utilityType, true);
        } else {
            templates = templateRepository.findByIsActive(true);
        }
        return ResponseEntity.ok(templates);
    }
}
