package com.meterverse.reporting.reportengine.application;

import com.meterverse.reporting.billing.domain.model.Invoice;
import com.meterverse.reporting.billing.domain.repository.InvoiceRepository;
import com.meterverse.reporting.reportengine.domain.ReportFormat;
import com.meterverse.reporting.reportengine.domain.ReportRequest;
import com.meterverse.reporting.reportengine.domain.ReportResult;
import com.meterverse.reporting.templatemanager.domain.ReportTemplate;
import com.meterverse.reporting.templatemanager.domain.repository.ReportTemplateRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.sf.jasperreports.engine.JRException;
import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.engine.JasperReport;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.io.OutputStream;
import java.time.Instant;
import java.util.*;

@Service
@Slf4j
@RequiredArgsConstructor
public class ReportService {

    private final ReportCompiler reportCompiler;
    private final ReportFiller reportFiller;
    private final ReportExporter reportExporter;
    private final InvoiceRepository invoiceRepository;
    private final ReportTemplateRepository templateRepository;

    @Transactional(readOnly = true)
    public ReportResult generateReport(ReportRequest request) {
        log.info("Generating report: {} in format {}", request.getReportName(), request.getFormat());

        ReportTemplate template = resolveTemplate(request.getReportName(), request.getParameters());
        JasperReport compiledReport;

        if (template.getJasperBytes() != null && template.getJasperBytes().length > 0) {
            compiledReport = reportCompiler.compile(template.getJasperBytes());
        } else {
            compiledReport = reportCompiler.compile(template.getJrxmlContent().getBytes());
        }

        JasperPrint filledReport;
        List<UUID> invoiceIds = request.getInvoiceIds();

        if (invoiceIds != null && !invoiceIds.isEmpty()) {
            List<Invoice> invoices = invoiceRepository.findAllById(invoiceIds);
            if (invoices.isEmpty()) {
                throw new EntityNotFoundException("No invoices found for IDs: " + invoiceIds);
            }
            filledReport = reportFiller.fillFromInvoices(invoices, compiledReport);
        } else {
            filledReport = reportFiller.fillWithCollection(
                    compiledReport,
                    request.getParameters() != null ? request.getParameters() : new HashMap<>(),
                    List.of(),
                    request.getLanguage()
            );
        }

        byte[] bytes = reportExporter.export(filledReport, request.getFormat());

        ReportResult result = ReportResult.builder()
                .reportName(request.getReportName())
                .format(request.getFormat())
                .bytes(bytes)
                .fileName(generateFileName(request))
                .generatedAt(Instant.now())
                .pageCount(getPageCount(filledReport))
                .fileSize(bytes.length)
                .build();

        if (request.getOutputStream() != null) {
            try {
                request.getOutputStream().write(bytes);
                request.getOutputStream().flush();
            } catch (IOException e) {
                log.error("Failed to write report to output stream", e);
                throw new RuntimeException("Failed to write report to output stream", e);
            }
        }

        log.info("Report generated: {} ({} bytes, {} pages)", result.getFileName(), result.getFileSize(), result.getPageCount());
        return result;
    }

    @Transactional(readOnly = true)
    public List<ReportResult> generateBatch(List<ReportRequest> requests) {
        log.info("Generating batch of {} reports", requests.size());
        List<ReportResult> results = new ArrayList<>(requests.size());
        for (ReportRequest request : requests) {
            try {
                ReportResult result = generateReport(request);
                results.add(result);
            } catch (Exception e) {
                log.error("Failed to generate report in batch: {}", request.getReportName(), e);
                results.add(ReportResult.builder()
                        .reportName(request.getReportName())
                        .format(request.getFormat())
                        .bytes(new byte[0])
                        .fileName("error_" + request.getReportName())
                        .generatedAt(Instant.now())
                        .pageCount(0)
                        .fileSize(0)
                        .build());
            }
        }
        return results;
    }

    private ReportTemplate resolveTemplate(String reportName, Map<String, Object> params) {
        String utilityType = params != null ? (String) params.get("utilityType") : null;

        if (utilityType != null) {
            return templateRepository.findByUtilityTypeAndIsActive(utilityType, true)
                    .stream()
                    .filter(t -> t.getName().equals(reportName) || t.getCode().equals(reportName))
                    .findFirst()
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Template not found for utilityType: " + utilityType + " and name: " + reportName));
        }

        return templateRepository.findByCode(reportName)
                .orElseThrow(() -> new EntityNotFoundException("Template not found: " + reportName));
    }

    private String generateFileName(ReportRequest request) {
        String timestamp = String.valueOf(System.currentTimeMillis());
        String baseName = request.getReportName() != null ? request.getReportName() : "report";
        return baseName + "_" + timestamp + request.getFormat().getExtension();
    }

    private int getPageCount(JasperPrint print) {
        try {
            return print.getPages().size();
        } catch (Exception e) {
            log.warn("Failed to get page count", e);
            return 0;
        }
    }
}
