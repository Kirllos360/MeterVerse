package com.meterverse.reporting.reportengine.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportResult {

    private String reportName;
    private ReportFormat format;
    private byte[] bytes;
    private String fileName;
    private Instant generatedAt;
    private int pageCount;
    private long fileSize;

    public String getMimeType() {
        return format != null ? format.getMimeType() : "application/octet-stream";
    }

    public String suggestedFileName() {
        if (fileName != null) return fileName;
        String ext = format != null ? format.getExtension() : ".bin";
        return (reportName != null ? reportName : "report") + ext;
    }
}
