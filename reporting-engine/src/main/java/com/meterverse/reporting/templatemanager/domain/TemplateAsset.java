package com.meterverse.reporting.templatemanager.domain;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "template_assets")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TemplateAsset {

    public enum AssetType {
        IMAGE, FONT, LOGO, SIGNATURE, SUBREPORT
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "template_id", nullable = false)
    private UUID templateId;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private AssetType type;

    @Column(nullable = false)
    private String name;

    @Column(name = "file_name")
    private String fileName;

    @Column(name = "mime_type")
    private String mimeType;

    @Lob
    @Column(name = "content", columnDefinition = "BYTEA")
    private byte[] content;

    @Column(name = "file_size")
    private long fileSize;

    @Column(name = "checksum")
    private String checksum;
}
