package com.meterverse.reporting.templatemanager.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "template_versions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TemplateVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "template_id", nullable = false)
    private UUID templateId;

    @Column(name = "version_number", nullable = false)
    private int versionNumber;

    @Column(name = "jrxml_content", columnDefinition = "TEXT")
    private String jrxmlContent;

    @Lob
    @Column(name = "jasper_bytes", columnDefinition = "BYTEA")
    private byte[] jasperBytes;

    @Column(name = "change_log", columnDefinition = "TEXT")
    private String changeLog;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "created_at")
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
    }
}
