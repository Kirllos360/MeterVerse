package com.meterverse.reporting.bulk.infrastructure;

import com.meterverse.reporting.billing.domain.model.Invoice;
import com.meterverse.reporting.billing.domain.repository.InvoiceRepository;
import com.meterverse.reporting.bulk.domain.BulkJob;
import com.meterverse.reporting.bulk.domain.BulkJobItem;
import com.meterverse.reporting.reportengine.domain.ReportFormat;
import com.meterverse.reporting.reportengine.domain.ReportRequest;
import com.meterverse.reporting.reportengine.application.ReportService;
import com.meterverse.reporting.reportengine.domain.ReportResult;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class BulkGenerationConsumer {

    private final InvoiceRepository invoiceRepository;
    private final ReportService reportService;

    @PersistenceContext
    private EntityManager entityManager;

    @RabbitListener(queues = "${reporting.rabbitmq.queue.report-generation:report-generation}")
    @Transactional
    public void consumeReportGenerationMessage(Map<String, Object> message) {
        String jobIdStr = (String) message.get("jobId");
        String itemIdStr = (String) message.get("itemId");
        String invoiceIdStr = (String) message.get("invoiceId");
        String formatStr = (String) message.get("format");

        UUID jobId = UUID.fromString(jobIdStr);
        UUID itemId = UUID.fromString(itemIdStr);
        UUID invoiceId = UUID.fromString(invoiceIdStr);
        ReportFormat format = ReportFormat.valueOf(formatStr);

        log.info("Consumer received: jobId={}, itemId={}, invoiceId={}, format={}",
                jobId, itemId, invoiceId, format);

        BulkJobItem item = entityManager.find(BulkJobItem.class, itemId);
        if (item == null) {
            log.error("BulkJobItem not found: {}", itemId);
            return;
        }

        try {
            item.setStatus(BulkJobItem.ItemStatus.PROCESSING);
            entityManager.merge(item);

            Invoice invoice = invoiceRepository.findById(invoiceId)
                    .orElseThrow(() -> new IllegalArgumentException("Invoice not found: " + invoiceId));

            ReportRequest request = ReportRequest.builder()
                    .reportName(invoice.getUtilityType() + "_invoice")
                    .format(format)
                    .invoiceIds(List.of(invoiceId))
                    .language(invoice.getLanguage() != null ? invoice.getLanguage() : "ar")
                    .build();

            ReportResult result = reportService.generateReport(request);

            item.setResultBytes(result.getBytes());
            item.setFileSize(result.getFileSize());
            item.setStatus(BulkJobItem.ItemStatus.COMPLETED);
            entityManager.merge(item);

            BulkJob job = entityManager.find(BulkJob.class, jobId);
            if (job != null) {
                job.setCompletedCount(job.getCompletedCount() + 1);
                if (job.getCompletedCount() + job.getFailedCount() >= job.getTotalCount()) {
                    job.setStatus(BulkJob.JobStatus.COMPLETED);
                    job.setCompletedAt(Instant.now());
                }
                entityManager.merge(job);
            }

            log.info("Successfully processed item {} for invoice {}", itemId, invoiceId);
        } catch (Exception e) {
            log.error("Failed to process item {} for invoice {}", itemId, invoiceId, e);

            item.setStatus(BulkJobItem.ItemStatus.FAILED);
            item.setErrorMessage(e.getMessage() != null ? e.getMessage() : "Unknown error");
            entityManager.merge(item);

            BulkJob job = entityManager.find(BulkJob.class, jobId);
            if (job != null) {
                job.setFailedCount(job.getFailedCount() + 1);
                if (job.getCompletedCount() + job.getFailedCount() >= job.getTotalCount()) {
                    job.setStatus(job.getFailedCount() > 0 ? BulkJob.JobStatus.COMPLETED : BulkJob.JobStatus.FAILED);
                    job.setCompletedAt(Instant.now());
                }
                entityManager.merge(job);
            }
        }
    }
}
