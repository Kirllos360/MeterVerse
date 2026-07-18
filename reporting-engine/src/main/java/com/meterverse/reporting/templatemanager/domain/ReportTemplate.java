package com.meterverse.reporting.templatemanager.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "report_templates")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(name = "utility_type")
    private String utilityType;

    @Version
    private int version;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "jrxml_content", columnDefinition = "TEXT")
    private String jrxmlContent;

    @Lob
    @Column(name = "jasper_bytes", columnDefinition = "BYTEA")
    private byte[] jasperBytes;

    @Column(name = "parameters_json", columnDefinition = "TEXT")
    private String parametersJson;

    @Column(name = "styles_json", columnDefinition = "TEXT")
    private String stylesJson;

    @Column(name = "is_active")
    @Builder.Default
    private boolean isActive = true;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }
}
