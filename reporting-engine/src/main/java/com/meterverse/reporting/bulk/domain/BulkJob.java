package com.meterverse.reporting.bulk.domain;

import com.meterverse.reporting.reportengine.domain.ReportFormat;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "bulk_jobs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BulkJob {

    public enum JobStatus {
        PENDING, PROCESSING, COMPLETED, FAILED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private JobStatus status = JobStatus.PENDING;

    @Column(name = "utility_type")
    private String utilityType;

    @Enumerated(EnumType.STRING)
    @Column(name = "format")
    private ReportFormat format;

    @Column(name = "total_count")
    private int totalCount;

    @Column(name = "completed_count")
    @Builder.Default
    private int completedCount = 0;

    @Column(name = "failed_count")
    @Builder.Default
    private int failedCount = 0;

    @Column(name = "error_log", columnDefinition = "TEXT")
    private String errorLog;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "created_by")
    private String createdBy;

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
    }
}
