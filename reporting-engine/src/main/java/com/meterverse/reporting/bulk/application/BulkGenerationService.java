package com.meterverse.reporting.bulk.application;

import com.meterverse.reporting.billing.domain.model.Invoice;
import com.meterverse.reporting.billing.domain.repository.InvoiceRepository;
import com.meterverse.reporting.bulk.domain.BulkJob;
import com.meterverse.reporting.bulk.domain.BulkJobItem;
import com.meterverse.reporting.reportengine.domain.ReportFormat;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Service
@Slf4j
@RequiredArgsConstructor
public class BulkGenerationService {

    private final RabbitTemplate rabbitTemplate;
    private final InvoiceRepository invoiceRepository;

    @PersistenceContext
    private EntityManager entityManager;

    @Value("${reporting.rabbitmq.queue.report-generation:report-generation}")
    private String reportGenerationQueue;

    @Transactional
    public BulkJob createJob(String utilityType, ReportFormat format, List<UUID> invoiceIds, String createdBy) {
        BulkJob job = BulkJob.builder()
                .utilityType(utilityType)
                .format(format)
                .totalCount(invoiceIds.size())
                .createdBy(createdBy)
                .build();
        entityManager.persist(job);
        entityManager.flush();

        List<Map<String, Object>> messages = new ArrayList<>();
        for (UUID invoiceId : invoiceIds) {
            BulkJobItem item = BulkJobItem.builder()
                    .jobId(job.getId())
                    .invoiceId(invoiceId)
                    .build();
            entityManager.persist(item);

            Map<String, Object> msg = new HashMap<>();
            msg.put("jobId", job.getId().toString());
            msg.put("itemId", item.getId().toString());
            msg.put("invoiceId", invoiceId.toString());
            msg.put("format", format.name());
            msg.put("utilityType", utilityType);
            messages.add(msg);
        }

        for (Map<String, Object> msg : messages) {
            rabbitTemplate.convertAndSend(reportGenerationQueue, msg);
        }

        log.info("Bulk job created: {} with {} items", job.getId(), invoiceIds.size());
        return job;
    }

    @Transactional
    public void processJob(UUID jobId) {
        BulkJob job = entityManager.find(BulkJob.class, jobId);
        if (job == null) {
            throw new IllegalArgumentException("Job not found: " + jobId);
        }
        job.setStatus(BulkJob.JobStatus.PROCESSING);
        entityManager.merge(job);

        List<BulkJobItem> items = entityManager.createQuery(
                        "SELECT i FROM BulkJobItem i WHERE i.jobId = :jobId", BulkJobItem.class)
                .setParameter("jobId", jobId)
                .getResultList();

        for (BulkJobItem item : items) {
            Invoice invoice = invoiceRepository.findById(item.getInvoiceId()).orElse(null);
            if (invoice == null) {
                item.setStatus(BulkJobItem.ItemStatus.FAILED);
                item.setErrorMessage("Invoice not found: " + item.getInvoiceId());
                entityManager.merge(item);
                continue;
            }

            Map<String, Object> message = new HashMap<>();
            message.put("jobId", jobId.toString());
            message.put("itemId", item.getId().toString());
            message.put("invoiceId", item.getInvoiceId().toString());
            message.put("format", job.getFormat().name());
            rabbitTemplate.convertAndSend(reportGenerationQueue, message);
        }
    }

    @Transactional(readOnly = true)
    public BulkJob getJobStatus(UUID jobId) {
        BulkJob job = entityManager.find(BulkJob.class, jobId);
        if (job == null) {
            throw new IllegalArgumentException("Job not found: " + jobId);
        }
        return job;
    }

    @Transactional(readOnly = true)
    public List<BulkJobItem> getJobResults(UUID jobId) {
        return entityManager.createQuery(
                        "SELECT i FROM BulkJobItem i WHERE i.jobId = :jobId ORDER BY i.createdAt",
                        BulkJobItem.class)
                .setParameter("jobId", jobId)
                .getResultList();
    }

    @Transactional(readOnly = true)
    public byte[] getJobItemResult(UUID itemId) {
        BulkJobItem item = entityManager.find(BulkJobItem.class, itemId);
        if (item == null) {
            throw new IllegalArgumentException("Job item not found: " + itemId);
        }
        return item.getResultBytes();
    }

    @Transactional
    public void cancelJob(UUID jobId) {
        BulkJob job = entityManager.find(BulkJob.class, jobId);
        if (job == null) {
            throw new IllegalArgumentException("Job not found: " + jobId);
        }
        job.setStatus(BulkJob.JobStatus.FAILED);
        job.setErrorLog("Job cancelled by user");
        entityManager.merge(job);
        log.info("Bulk job cancelled: {}", jobId);
    }
}
